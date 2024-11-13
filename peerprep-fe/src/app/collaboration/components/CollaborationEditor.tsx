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

  // Refs for persistent state
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const docRef = useRef<Y.Doc | null>(null);
  const prevClientsRef = useRef<Map<number, ConnectedClient>>(new Map());
  const mountCountRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const clientChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sockServerURI =
    process.env.NEXT_PUBLIC_SOCK_SERVER_URL || 'ws://localhost:4444';
  const { toast } = useToast();
  const { clearLastMatchId } = useCollaborationStore();
  const router = useRouter();

  const TOAST_DEBOUNCE = 1000; // Minimum time between toasts

  const onLanguageChange = (language: string) => {
    setLanguage(language);
  };

  const handleClientStateChange = (states: Map<any, any>) => {
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < TOAST_DEBOUNCE) {
      return;
    }

    const newClients = new Map<number, ConnectedClient>();
    states.forEach((value: { [x: string]: any }) => {
      const state = value as AwarenessState;
      if (state.client) {
        newClients.set(state.client, {
          id: state.client,
          user: state.user,
        });
      }
    });

    // Clear any pending timeout
    if (clientChangeTimeoutRef.current) {
      clearTimeout(clientChangeTimeoutRef.current);
    }

    // Set a new timeout to handle the change
    clientChangeTimeoutRef.current = setTimeout(() => {
      if (newClients.size !== prevClientsRef.current.size) {
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
          lastUpdateTimeRef.current = now;
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
            lastUpdateTimeRef.current = now;
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
    }, 500); // Debounce time for client changes
  };

  const initializeWebSocket = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    if (!matchId) {
      console.error('Cannot initialize: Match ID is undefined');
      return;
    }

    // If we already have a connection, don't reinitialize
    if (providerRef.current?.wsconnected) {
      console.log('Reusing existing WebSocket connection');
      return;
    }

    console.log('Initializing new WebSocket connection');

    // Create new Y.Doc if it doesn't exist
    if (!docRef.current) {
      docRef.current = new Y.Doc();
    }

    // Create new WebSocket provider with valid configuration options
    providerRef.current = new WebsocketProvider(
      sockServerURI,
      matchId,
      docRef.current,
      {
        connect: true,
        resyncInterval: 3000, // Time between resync attempts
        disableBc: true, // Disable broadcast channel to prevent duplicate connections
        params: {
          version: '1.0.0', // Optional version parameter
        },
      },
    );

    const type = docRef.current.getText('monaco');

    providerRef.current.awareness.setLocalState({
      client: user?.id,
      user: {
        name: user?.username,
        color: stringToColor(user?.id || ''),
      },
    });

    // Add connection status handlers
    providerRef.current.on('status', ({ status }: { status: string }) => {
      console.log('WebSocket status:', status);
    });

    providerRef.current.on('connection-error', (event: Event) => {
      console.error('WebSocket connection error:', event);
    });

    // Set up awareness change handler with debouncing
    let changeTimeout: NodeJS.Timeout;
    providerRef.current.awareness.on('change', () => {
      clearTimeout(changeTimeout);
      changeTimeout = setTimeout(() => {
        const states = providerRef.current?.awareness.getStates();
        if (states) {
          handleClientStateChange(states);
        }
      }, 100);
    });

    // Set up Monaco binding
    const model = editor.getModel();
    if (editor && model) {
      bindingRef.current = new MonacoBinding(
        type,
        model,
        new Set([editor]),
        providerRef.current.awareness,
      );
    }
  };

  const handleEditorMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    initializeWebSocket(editor);
  };

  // Cleanup function
  const cleanup = (force = false) => {
    if (clientChangeTimeoutRef.current) {
      clearTimeout(clientChangeTimeoutRef.current);
      clientChangeTimeoutRef.current = null;
    }

    if (force) {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }

      if (docRef.current) {
        docRef.current.destroy();
        docRef.current = null;
      }

      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }

      prevClientsRef.current = new Map();
      setConnectedClients(new Map());
    }
  };

  // Mount/unmount handling
  useEffect(() => {
    mountCountRef.current++;
    console.log(`Editor component mounted (count: ${mountCountRef.current})`);

    return () => {
      mountCountRef.current--;
      console.log(
        `Editor component unmounting (count: ${mountCountRef.current})`,
      );

      // Only do full cleanup when last instance unmounts
      cleanup(mountCountRef.current === 0);
    };
  }, []);

  // Handle page unload
  useEffect(() => {
    const handleUnload = () => {
      cleanup(true);
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const handleLeaveSession = () => {
    cleanup(true);
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
