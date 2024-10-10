'use client';
import MainComponent from './components/Main';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

export default function Home() {
  const { isLoading } = useAuth();
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <MainComponent />;
}
