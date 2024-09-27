'use client';
import { useEffect, useState } from 'react';
import axiosQuestionClient from '@/network/axiosClient';
import FilterBar from './filter/FilterBar';
import ProblemTable from './problems/ProblemTable';
import { Problem } from '@/types/types';

export default function LoggedIn() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    // Fetch data from backend API
    const fetchProblems = async () => {
      try {
        const response = await axiosQuestionClient.get('/questions');
        setProblems(response.data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6 pt-24 text-gray-100">
      <div className="mx-auto max-w-7xl">
        <FilterBar />
        <ProblemTable problems={problems} />
      </div>
    </div>
  );
}
