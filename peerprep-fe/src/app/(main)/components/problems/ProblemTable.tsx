'use client';
import { useSearchStore } from '@/state/useSearchStore';
import { useMemo } from 'react';
import { Problem } from '@/types/types';
import ProblemRow from './ProblemRow';

interface ProblemTableProps {
  problems: Problem[];
}

export default function ProblemTable({ problems }: ProblemTableProps) {
  const { searchTerm } = useSearchStore();

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) =>
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [problems, searchTerm]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-700 text-left">
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Topics</th>
            <th className="px-4 py-2">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {filteredProblems.map((problem, index) => (
            <ProblemRow key={index} problem={problem} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
