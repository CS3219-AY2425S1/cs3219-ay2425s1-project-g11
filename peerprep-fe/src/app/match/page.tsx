'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/state/useAuthStore';
import { useWebSocket } from '@/hooks/useWebsocket';
import { axiosClient } from '@/network/axiosClient';

export default function LoadingPage() {
  const { user } = useAuthStore();
  // Add connection status handling
  const { lastMessage, disconnect } = useWebSocket(
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8001',
    user?.id || '',
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const [matchStatus, setMatchStatus] = useState('searching');
  const router = useRouter();

  // Handle WebSocket messages and connection status
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.status === 'matched') {
        console.log('Match found, your partner is', lastMessage.match.name);
        setMatchStatus('matched');
        const matchId = lastMessage.matchId;
        setTimeout(() => {
          router.push(`/collaboration?matchId=${matchId}`);
        }, 4000);
      } else {
        console.log('Match failed');
        setMatchStatus('failed');
      }
    }
  }, [lastMessage, router]);

  useEffect(() => {
    setElapsedTime(0);
    setMatchStatus('searching');

    const interval = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    // Cleanup function
    return () => {
      clearInterval(interval);
      disconnect(); // Disconnect WebSocket when component unmounts
    };
  }, [disconnect]);

  useEffect(() => {
    if (elapsedTime >= 60 && matchStatus === 'searching') {
      console.log('Elapsed time reached 60 seconds. Match timed out.');
      setMatchStatus('timeout');
    }
  }, [elapsedTime, matchStatus]);

  const handleCancel = async () => {
    console.log('Matching cancelled');
    if (user?.id) {
      try {
        await axiosClient.post('/matching/send', {
          _id: user.id,
          type: 'cancel',
        });
        router.push('/');
      } catch (error) {
        console.error('Error cancelling match:', error);
      }
    } else {
      console.warn('User ID is undefined. This is not supposed to happen.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 p-6 text-gray-100">
      <main className="flex flex-grow flex-col items-center justify-center space-y-6 px-4">
        {matchStatus === 'searching' && (
          <>
            <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-purple-500"></div>
            <h1 className="text-2xl font-bold text-white">Finding a match</h1>
            <p className="max-w-md text-center text-sm">
              We&apos;re pairing you with another coder. This may take a few
              moments.
            </p>
            <div className="w-full max-w-md space-y-2">
              <div className="h-1 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${((elapsedTime % 60) / 60) * 100}%` }}
                ></div>
              </div>
              <div className="text-center text-sm">
                Time elapsed: {elapsedTime} seconds
              </div>
            </div>
            <Button
              onClick={handleCancel}
              className="w-full max-w-md bg-purple-600 hover:bg-purple-700"
            >
              Cancel Matching
            </Button>
          </>
        )}
        {matchStatus === 'matched' && (
          <>
            <div className="h-16 w-16 animate-bounce text-4xl">🎉</div>
            <h1 className="text-2xl font-bold text-white">Match Found!</h1>
            <p className="max-w-md text-center text-sm">
              Great news! We&apos;ve found a coding partner for you. Redirecting
              to your collaboration room...
            </p>
          </>
        )}
        {matchStatus === 'failed' && (
          <>
            <div className="h-16 w-16 text-4xl">😕</div>
            <h1 className="text-2xl font-bold text-white">Match Failed</h1>
            <p className="max-w-md text-center text-sm">
              We couldn&apos;t find a suitable match at this time. Please try
              again later.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="w-full max-w-md bg-purple-600 hover:bg-purple-700"
            >
              Return to Home
            </Button>
          </>
        )}
        {matchStatus === 'timeout' && (
          <>
            <div className="h-16 w-16 text-4xl">⏳</div>
            <h1 className="text-2xl font-bold text-white">Match Timed Out</h1>
            <p className="max-w-md text-center text-sm">
              We couldn&apos;t find a match within the time limit. Please try
              again.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="w-full max-w-md bg-purple-600 hover:bg-purple-700"
            >
              Return to Home
            </Button>
          </>
        )}
        {matchStatus === 'error' && (
          <>
            <div className="h-16 w-16 text-4xl">❌</div>
            <h1 className="text-2xl font-bold text-white">Error Occurred</h1>
            <p className="max-w-md text-center text-sm">
              An error occurred while finding a match. Please try again later.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="w-full max-w-md bg-purple-600 hover:bg-purple-700"
            >
              Return to Home
            </Button>
          </>
        )}
        <p className="mt-4 text-sm text-gray-500">
          Tip: While you wait, why not review some coding concepts?
        </p>
      </main>
    </div>
  );
}
