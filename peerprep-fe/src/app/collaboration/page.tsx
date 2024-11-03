'use client';

import ProblemCodeEditor from '@/components/problems/ProblemCodeEditor';
import ProblemDescriptionPanel from '@/components/problems/ProblemDescriptionPanel';
import ProblemTable from '@/components/problems/ProblemTable';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFilteredProblems } from '@/hooks/useFilteredProblems';
import { DEFAULT_CODE, SUPPORTED_PROGRAMMING_LANGUAGES } from '@/lib/constants';
import { Problem } from '@/types/types';
import { UserCircle, UserX } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { editor as MonacoEditor } from 'monaco-editor';

const CollaborationPage = () => {
  const [selectionProblem, setSelectionProblem] = useState<Problem | null>(
    null,
  );
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId');
  const [language, setLanguage] = useState(SUPPORTED_PROGRAMMING_LANGUAGES[0]);
  const { problems, isLoading } = useFilteredProblems();
  const [connectedClients, setConnectedClients] = useState<Set<number>>(
    new Set(),
  );
  const [disconnectionAlert, setDisconnectionAlert] = useState<string | null>(
    null,
  );

  // Layout states
  const [leftWidth, setLeftWidth] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const editorRef = React.useRef<MonacoEditor.IStandaloneCodeEditor | null>(
    null,
  );
  const sockServerURI = process.env.SOCK_SERVER_URL || 'ws://localhost:4444';

  // Handle dragging of the divider
  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setLeftWidth(Math.max(20, Math.min(80, newLeftWidth)));
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleEditorMount = (editor: any, monaco: any) => {
    if (!matchId) {
      console.error('Cannot mount editor: Match ID is undefined');
      return;
    }
    editorRef.current = editor;
    const doc = new Y.Doc();
    providerRef.current = new WebsocketProvider(sockServerURI, matchId, doc);
    const type = doc.getText('monaco');

    // Set up awareness handling
    providerRef.current.awareness.setLocalState({
      client: Math.floor(Math.random() * 1000000), // Generate random client ID
      user: {
        name: `User ${Math.floor(Math.random() * 100)}`, // You can replace this with actual user info
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
      },
    });

    // Handle client updates
    providerRef.current.awareness.on('change', () => {
      const states = providerRef.current?.awareness.getStates();
      if (states) {
        const clients = new Set<number>();
        states.forEach((state: any) => {
          if (state.client) {
            clients.add(state.client);
          }
        });
        setConnectedClients(clients);
      }
    });

    // Handle disconnections
    providerRef.current.on('status', ({ status }: { status: string }) => {
      if (status === 'disconnected') {
        setDisconnectionAlert('A user has disconnected from the room');
        // Auto-hide the alert after 3 seconds
        setTimeout(() => setDisconnectionAlert(null), 3000);
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
    } else {
      console.error('Monaco editor model is null');
    }
  };

  const handleCallback = (id: number) => {
    const problem = problems.find((p) => p._id === id);
    if (problem) {
      setSelectionProblem(problem);
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

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-900 p-6 pt-24 text-gray-100"
      ref={containerRef}
    >
      <div
        className="h-full overflow-y-auto p-6"
        style={{ width: `${leftWidth}%` }}
      >
        {selectionProblem ? (
          <ProblemDescriptionPanel
            problem={selectionProblem}
            resetQuestion={() => setSelectionProblem(null)}
          />
        ) : (
          <>
            <h2 className="mb-4 text-2xl font-bold">Choose a question</h2>
            <ProblemTable
              problems={problems}
              isLoading={isLoading}
              rowCallback={handleCallback}
            />
          </>
        )}
      </div>

      <div
        className="flex w-2 cursor-col-resize items-center justify-center bg-gray-600 transition-colors duration-200 hover:bg-gray-500"
        onMouseDown={handleMouseDown}
      >
        <div className="h-8 w-1 rounded-full bg-gray-400" />
      </div>

      <div
        className="flex h-full flex-col overflow-y-auto bg-gray-800 p-6"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <div className="mb-4 flex justify-between">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_PROGRAMMING_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            {Array.from(connectedClients).map((clientId) => (
              <Button
                key={clientId}
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-full"
                title={`User ${clientId}`}
              >
                <UserCircle className="h-6 w-6 text-gray-300" />
              </Button>
            ))}
          </div>
        </div>

        <ProblemCodeEditor onMount={handleEditorMount} />
      </div>
    </div>
  );
};

export default CollaborationPage;
