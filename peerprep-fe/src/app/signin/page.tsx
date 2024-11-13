'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { GithubIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { axiosClient } from '@/network/axiosClient';
import { login } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/state/useAuthStore';
import { initiateOAuth } from '@/lib/oauth';

// Add Props type for the page
type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function LoginForm({ searchParams }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const error = searchParams?.error;
    if (error) {
      setError('email or username already exists');
    }
  }, [searchParams]);

  // handle login here
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await axiosClient.post('/auth/login', {
        email: email,
        password: password,
      });

      const data = result.data.data;
      if (result.status === 200) {
        const token = data.accessToken;
        const res = await login(token);
        if (res) {
          setAuth(true, token, data);
          router.push('/');
          return;
        }
      }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Please provide correct email and password';
      setError(message);
    }
  };

  const handleGithubLogin = () => {
    initiateOAuth('github');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-gray-800 p-8 shadow-xl">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">PeerPrep</h2>
          <p className="text-sm text-gray-400">Sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800">
            Sign in
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-800 px-2 text-gray-400">
              Or continue with
            </span>
          </div>
        </div>
        <div className="flex w-full justify-center gap-3">
          <Button
            variant="outline"
            className="rounded-md border border-gray-600 bg-gray-700 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            onClick={handleGithubLogin}
          >
            <GithubIcon className="mr-2 h-5 w-5" />
            GitHub
          </Button>
        </div>
        <div className="flex justify-center text-center text-sm text-gray-400">
          Do not have an account?
          <span className="mx-1" />
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up with email
          </Link>
        </div>
      </div>
    </div>
  );
}
