'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Code } from 'lucide-react';
import { consumeMessageFromQueue } from '@/lib/rabbitmq';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/state/useAuthStore';

export default function LoadingPage() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [usersWaiting, setUsersWaiting] = useState(4);
  const [matchStatus, setMatchStatus] = useState('searching');
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const startConsumingMessages = async () => {
      try {
        await consumeMessageFromQueue(user?.id ?? '').then((message) => {
          if (message.status === 'matched') {
            console.log('Match found, your partner is', message.partner);
            setMatchStatus('matched');

            // setTimeout(() => {
            //   router.push(`/collaboration`);
            // }, 2000);
          } else {
            console.log('Match failed');
            setMatchStatus('failed');

            // setTimeout(() => {
            //   router.push(`/`);
            // }, 4500);
          }
        });
      } catch (error) {
        console.error('Error consuming message:', error);
        setMatchStatus('error');
      }
    };

    startConsumingMessages();
    const timer = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);
    setUsersWaiting(5);
    return () => clearInterval(timer);
  }, [user?.id]);

  useEffect(() => {
    if (elapsedTime >= 60 && matchStatus === 'searching') {
      console.log('Elapsed time reached 60 seconds. Match timed out.');
      setMatchStatus('timeout');
    }
  }, [elapsedTime, matchStatus]);

  const handleCancel = () => {
    // Implement logic to cancel the matching process
    console.log('Matching cancelled');
    router.push('/');
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
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4" />
              <span>{usersWaiting} users waiting</span>
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
