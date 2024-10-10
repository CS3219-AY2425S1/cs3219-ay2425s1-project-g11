'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-6 text-gray-100">
      <h1 className="mb-4 text-4xl font-bold">Welcome to PeerPrep</h1>
      <p className="mb-8 text-xl">Practice coding interviews with peers</p>
      <div className="space-x-4">
        <Link href="/signup">
          <button className="linbg-blue-500 rounded px-4 py-2 font-bold text-white hover:bg-blue-600">
            Sign Up
          </button>
        </Link>
        <button className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-600">
          Learn More
        </button>
      </div>
    </div>
  );
}
