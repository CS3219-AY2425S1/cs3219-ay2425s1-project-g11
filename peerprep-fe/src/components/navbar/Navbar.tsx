import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-10 w-full bg-gray-800 p-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">
          PeerPrep
        </Link>
        <div className="space-x-4">
          <Link href="/" className="text-gray-300 hover:text-white">
            Problems
          </Link>
          <Link href="/match" className="text-gray-300 hover:text-white">
            Match
          </Link>
          <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}
