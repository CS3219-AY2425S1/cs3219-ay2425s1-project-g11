'use client';
import { Problem } from '@/types/types';
import ProblemRow from './ProblemRow';
import { Skeleton } from '@/components/ui/skeleton';

interface ProblemTableProps {
  problems: Problem[];
  isLoading: boolean;
}

export default function ProblemTable({
  problems,
  isLoading,
}: ProblemTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-700 text-left">
            <th className="w-28 px-4 py-2">Status</th>
            <th className="w-1/3 px-4 py-2">Title</th>
            <th className="px-4 py-2">Topics</th>
            <th className="px-4 py-2">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="w-28 px-4 py-2">
                    <Skeleton className="h-5 w-5 bg-gray-600" />
                  </td>
                  <td className="w-1/3 px-4 py-2">
                    <Skeleton className="h-6 w-full bg-gray-600" />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap">
                      <Skeleton className="mb-1 mr-1 h-6 w-16 rounded-full bg-gray-600" />
                      <Skeleton className="mb-1 mr-1 h-6 w-16 rounded-full bg-gray-600" />
                      <Skeleton className="mb-1 mr-1 h-6 w-16 rounded-full bg-gray-600" />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="h-6 w-16 bg-gray-600" />
                  </td>
                </tr>
              ))
            : problems.map((problem) => (
                <ProblemRow key={problem._id} problem={problem} />
              ))}
        </tbody>
      </table>
    </div>
  );
}
