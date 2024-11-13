'use client';

import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { editor as MonacoEditor } from 'monaco-editor';
import { useAuthStore } from '@/state/useAuthStore';
import Avatar, { genConfig } from 'react-nice-avatar';
import CodeEditor from './CodeEditor';
import { Button } from '@/components/ui/button';
import { AwarenessState, ConnectedClient } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { useCollaborationStore } from '@/state/useCollaborationStore';
import { useRouter } from 'next/navigation';
import { stringToColor } from '@/lib/utils';
import LanguageSelector from './LanguageSelector';
import LeaveSessionDialog from './AlertDialogues';
import { SUPPORTED_PROGRAMMING_LANGUAGES } from '@/lib/constants';
import AudioSharing from './AudioSharing';

interface CollaborationEditorProps {
  matchId: string | null;
}

const CollaborationEditor = ({ matchId }: CollaborationEditorProps) => {
  const { user } = useAuthStore();
  const [language, setLanguage] = useState(SUPPORTED_PROGRAMMING_LANGUAGES[0]);
  const [connectedClients, setConnectedClients] = useState<
    Map<number, ConnectedClient>
  >(new Map());
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const prevClientsRef = useRef<Map<number, ConnectedClient>>(new Map());
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const awarenessUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sockServerURI =
    process.env.NEXT_PUBLIC_SOCK_SERVER_URL || 'ws://localhost:4444';
  const { toast } = useToast();
  const { clearLastMatchId } = useCollaborationStore();
  const router = useRouter();

  const onLanguageChange = (language: string) => {
    setLanguage(language);
  };

  const updateLocalAwareness = () => {
    if (providerRef.current?.awareness && user) {
      providerRef.current.awareness.setLocalState({
        client: user.id,
        user: {
          name: user.username,
          color: stringToColor(user.id || ''),
        },
      });
    }
  };

  const handleAwarenessUpdate = () => {
    const states = providerRef.current?.awareness.getStates();
    if (!states) return;

    // Clear any pending awareness update
    if (awarenessUpdateTimeoutRef.current) {
      clearTimeout(awarenessUpdateTimeoutRef.current);
    }

    // Debounce awareness updates
    awarenessUpdateTimeoutRef.current = setTimeout(() => {
      const newClients = new Map<number, ConnectedClient>();

      states.forEach((value) => {
        const state = value as AwarenessState;
        if (state.client) {
          newClients.set(state.client, {
            id: state.client,
            user: state.user,
          });
        }
      });

      // Only process changes if the client list has actually changed
      const currentClientIds = Array.from(prevClientsRef.current.keys()).sort();
      const newClientIds = Array.from(newClients.keys()).sort();

      if (JSON.stringify(currentClientIds) !== JSON.stringify(newClientIds)) {
        // Handle new connections
        const newConnections = newClientIds.filter(
          (id) => !currentClientIds.includes(id) && id.toString() !== user?.id,
        );

        if (newConnections.length > 0) {
          const newUsers = newConnections
            .map((id) => newClients.get(id)?.user.name)
            .filter(Boolean);

          if (newUsers.length > 0) {
            toast({
              title: 'User Connected!',
              description:
                newUsers.length === 1
                  ? `${newUsers[0]} joined the session`
                  : `${newUsers.slice(0, -1).join(', ')} and ${newUsers[newUsers.length - 1]} joined the session`,
              variant: 'success',
            });
          }
        }

        // Handle disconnections
        const disconnections = currentClientIds.filter(
          (id) => !newClientIds.includes(id) && id.toString() !== user?.id,
        );

        disconnections.forEach((id) => {
          const disconnectedUser = prevClientsRef.current.get(id);
          if (disconnectedUser) {
            toast({
              title: 'User Disconnected',
              description: `${disconnectedUser.user.name} left the session`,
              variant: 'warning',
            });
          }
        });

        prevClientsRef.current = newClients;
        setConnectedClients(newClients);
      }
    }, 1000);
  };

  const handleEditorMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    if (!matchId) {
      console.error('Cannot mount editor: Match ID is undefined');
      return;
    }

    editorRef.current = editor;
    const doc = new Y.Doc();

    providerRef.current = new WebsocketProvider(sockServerURI, matchId, doc, {
      connect: true,
      params: { keepalive: 'true' },
      WebSocketPolyfill: WebSocket,
      resyncInterval: 5000,
      maxBackoffTime: 2500,
      disableBc: true, // Disable broadcast channel to prevent duplicate events
    });

    providerRef.current.on('status', ({ status }: { status: string }) => {
      if (status === 'connected') {
        // Clear any pending connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }

        // Update awareness state
        updateLocalAwareness();
      }
    });

    const type = doc.getText('monaco');
    updateLocalAwareness();

    // Set up awareness change handler
    providerRef.current.awareness.on('change', handleAwarenessUpdate);

    const model = editorRef.current?.getModel();
    if (editorRef.current && model) {
      bindingRef.current = new MonacoBinding(
        type,
        model,
        new Set([editorRef.current]),
        providerRef.current.awareness,
      );
    }

    // Set up periodic awareness state refresh
    const refreshInterval = setInterval(() => {
      if (providerRef.current?.wsconnected) {
        updateLocalAwareness();
      }
    }, 5000);

    return () => {
      clearInterval(refreshInterval);
    };
  };

  useEffect(() => {
    return () => {
      // Clear all timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (awarenessUpdateTimeoutRef.current) {
        clearTimeout(awarenessUpdateTimeoutRef.current);
      }

      // Clean up provider and binding
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      if (providerRef.current) {
        providerRef.current.disconnect();
        providerRef.current.destroy();
        providerRef.current = null;
      }

      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  const handleLeaveSession = () => {
    if (providerRef.current?.awareness) {
      providerRef.current.awareness.setLocalState(null);
    }
    clearLastMatchId();
    router.push('/');
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <LanguageSelector
            language={language}
            onSelect={onLanguageChange}
            supportedLanguages={SUPPORTED_PROGRAMMING_LANGUAGES}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {Array.from(connectedClients.values()).map((client) => (
              <Button
                key={client.id}
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-full"
                title={client.user.name}
                style={{ outline: `2px solid ${client.user.color}` }}
              >
                <div className="h-full w-full scale-x-[-1] transform">
                  <Avatar
                    style={{ width: '100%', height: '100%' }}
                    {...genConfig(client.user.name)}
                  />
                </div>
              </Button>
            ))}
          </div>
          <LeaveSessionDialog onLeave={handleLeaveSession} />
        </div>
      </div>
      <CodeEditor
        onMount={handleEditorMount}
        language={language.toLowerCase()}
      />
      <AudioSharing />
    </>
  );
};

export default CollaborationEditor;
