'use client';
import { Problem } from '@/types/types';
import ProblemRow from './ProblemRow';
import { Skeleton } from '@/components/ui/skeleton';
import { AxiosResponse } from 'axios';
import { useEffect, useRef } from 'react';

interface ProblemTableProps {
  problems: Problem[];
  isLoading: boolean;
  showActions?: boolean;
  hasMore: boolean; // Add this
  onLoadMore: () => void; // Add this
  handleDelete?:
    | ((id: number) => Promise<AxiosResponse<unknown, unknown>>)
    | undefined;
  handleEdit?:
    | ((problem: Problem) => Promise<AxiosResponse<unknown, unknown>>)
    | undefined;
  rowCallback?: (id: number) => void;
}

export default function ProblemTable({
  problems,
  isLoading,
  showActions = false,
  hasMore,
  onLoadMore,
  handleDelete,
  handleEdit,
  rowCallback,
}: ProblemTableProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          onLoadMore();
          console.log('Loaded 10 more entries');
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isLoading, hasMore, onLoadMore]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-700 text-left">
            <th className="w-1/3 px-4 py-2">Title</th>
            <th className="px-4 py-2">Topics</th>
            <th className="px-4 py-2">Difficulty</th>
            {showActions && <th className="px-4 py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <ProblemRow
              key={problem._id}
              problem={problem}
              showActions={showActions}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              rowCallback={rowCallback}
            />
          ))}
        </tbody>
      </table>

      {/* Observer target and loading indicator */}
      <div ref={observerTarget} className="w-full py-4">
        {(isLoading || hasMore) && (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full bg-gray-600" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* End of list message */}
      {!hasMore && problems.length > 0 && (
        <div className="py-4 text-center text-gray-400">
          No more problems to load
        </div>
      )}
    </div>
  );
}
