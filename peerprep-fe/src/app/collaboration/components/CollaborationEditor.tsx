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
  const sockServerURI =
    process.env.NEXT_PUBLIC_SOCK_SERVER_URL || 'ws://localhost:4444';
  const { toast } = useToast();
  const { clearLastMatchId } = useCollaborationStore();
  const router = useRouter();

  const onLanguageChange = (language: string) => {
    setLanguage(language);
  };

  const handleEditorMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    if (!matchId) {
      console.error('Cannot mount editor: Match ID is undefined');
      return;
    }
    editorRef.current = editor;
    const doc = new Y.Doc();

    // Configure the WebsocketProvider with keepalive settings
    providerRef.current = new WebsocketProvider(sockServerURI, matchId, doc, {
      connect: true,
      params: {
        keepalive: 'true', // Enable keepalive
      },
      resyncInterval: 3000, // More frequent resyncs (3 seconds)
      maxBackoffTime: 500, // Faster reconnection attempts
    });

    // Listen for connection status changes
    providerRef.current.on('status', ({ status }: { status: string }) => {
      if (status === 'connected') {
        // Re-set local state when reconnected to ensure presence
        providerRef.current?.awareness.setLocalState({
          client: user?.id,
          user: {
            name: user?.username,
            color: stringToColor(user?.id || ''),
          },
        });
      }
    });

    const type = doc.getText('monaco');

    providerRef.current.awareness.setLocalState({
      client: user?.id,
      user: {
        name: user?.username,
        color: stringToColor(user?.id || ''),
      },
    });

    providerRef.current.awareness.on('change', () => {
      const states = providerRef.current?.awareness.getStates();
      if (states) {
        const newClients = new Map<number, ConnectedClient>();
        // Build new clients map
        states.forEach((value) => {
          const state = value as AwarenessState;
          if (state.client) {
            newClients.set(state.client, {
              id: state.client,
              user: state.user,
            });
          }
        });

        // Compare entire client lists instead of just size
        const currentClients = Array.from(prevClientsRef.current.keys())
          .sort()
          .join(',');
        const newClientsList = Array.from(newClients.keys()).sort().join(',');
        const clientsChanged = currentClients !== newClientsList;

        if (clientsChanged) {
          // Check for new connections
          const newConnectedUsers = Array.from(newClients.values())
            .filter(
              (client) =>
                !Array.from(prevClientsRef.current.values()).some(
                  (c) => c.id === client.id,
                ) && client.id.toString() !== user?.id,
            )
            .map((client) => client.user.name);

          if (newConnectedUsers.length > 0) {
            const description =
              newConnectedUsers.length === 1
                ? `${newConnectedUsers[0]} joined the session`
                : `${newConnectedUsers.slice(0, -1).join(', ')} and ${
                    newConnectedUsers[newConnectedUsers.length - 1]
                  } joined the session`;

            toast({
              title: 'User Connected!',
              description,
              variant: 'success',
            });
          }

          // Check for disconnections
          Array.from(prevClientsRef.current.values()).forEach((prevClient) => {
            if (
              !Array.from(newClients.values()).some(
                (client) => client.id === prevClient.id,
              ) &&
              prevClient.id.toString() !== user?.id
            ) {
              toast({
                title: 'User Disconnected',
                description: `${prevClient.user.name} left the session`,
                variant: 'warning',
              });
            }
          });
        }

        prevClientsRef.current = newClients;
        setConnectedClients(newClients);
      }
    });

    const model = editorRef.current?.getModel();
    if (editorRef.current && model) {
      bindingRef.current = new MonacoBinding(
        type,
        model,
        new Set([editorRef.current]),
        providerRef.current.awareness,
      );
    }
  };

  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      if (providerRef.current) {
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
    // Clear awareness state before leaving
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
