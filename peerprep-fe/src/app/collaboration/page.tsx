'use client';

import React, { useState } from 'react';
import { Code, User, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CollaborationPage = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, newMessage]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#1a1f2e] text-gray-300">
      <header className="flex items-center justify-between border-b border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <Code className="h-6 w-6" />
          <span className="text-lg font-semibold">PeerPrep</span>
        </div>
        <User className="h-6 w-6" />
      </header>
      <main className="flex flex-grow">
        <div className="flex-grow p-4">
          <div className="mb-4 rounded-lg bg-gray-800 p-4">
            <h2 className="mb-2 text-xl font-bold">Coding Problem</h2>
            <p>
              Implement a function that finds the longest palindromic substring
              in a given string.
            </p>
          </div>
          <div className="h-[calc(100vh-300px)] rounded-lg bg-gray-800 p-4">
            <h2 className="mb-2 text-xl font-bold">Code Editor</h2>
            <textarea
              className="h-full w-full resize-none rounded bg-gray-900 p-2 text-sm text-gray-300"
              placeholder="Write your code here..."
            ></textarea>
          </div>
        </div>
        <div className="w-80 border-l border-gray-700 p-4">
          <h2 className="mb-4 flex items-center text-xl font-bold">
            <MessageSquare className="mr-2 h-5 w-5" />
            Chat
          </h2>
          <div className="mb-4 h-[calc(100vh-250px)] overflow-y-auto rounded-lg bg-gray-800 p-4">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2 rounded bg-gray-700 p-2">
                {msg}
              </div>
            ))}
          </div>
          <div className="flex">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="mr-2 flex-grow"
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CollaborationPage;
