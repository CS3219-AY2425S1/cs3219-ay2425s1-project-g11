'use client';

import ProblemDescriptionPanel from '@/components/problems/ProblemDescriptionPanel';
import ProblemTable from '@/components/problems/ProblemTable';
import { useFilteredProblems } from '@/hooks/useFilteredProblems';
import { Problem } from '@/types/types';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { useCollaborationStore } from '@/state/useCollaborationStore';
import dynamic from 'next/dynamic';
import EditorSkeleton from './components/EditorSkeleton';

const CollaborationEditor = dynamic(
  () => import('./components/CollaborationEditor'),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  },
);

function CollaborationPageContent() {
  const [selectionProblem, setSelectionProblem] = useState<Problem | null>(
    null,
  );
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId');
  const { problems, isLoading, hasMore, loadMore } = useFilteredProblems();
  const { setLastMatchId } = useCollaborationStore();

  useEffect(() => {
    if (matchId) {
      console.log('Setting last match ID to', matchId);
      setLastMatchId(matchId);
    }
  }, [matchId, setLastMatchId]);

  // Layout states
  const [leftWidth, setLeftWidth] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle dragging of the divider
  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setLeftWidth(Math.max(20, Math.min(80, newLeftWidth)));
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleCallback = (id: number) => {
    const problem = problems.find((p) => p._id === id);
    if (problem) {
      setSelectionProblem(problem);
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-900 p-6 pt-24 text-gray-100"
      ref={containerRef}
    >
      <div
        className="h-full overflow-y-auto p-6"
        style={{ width: `${leftWidth}%` }}
      >
        {selectionProblem ? (
          <ProblemDescriptionPanel
            problem={selectionProblem}
            resetQuestion={() => setSelectionProblem(null)}
          />
        ) : (
          <>
            <h2 className="mb-4 text-2xl font-bold">Choose a question</h2>
            <ProblemTable
              problems={problems}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              rowCallback={handleCallback}
            />
          </>
        )}
      </div>

      <div
        className="flex w-2 cursor-col-resize items-center justify-center bg-gray-600 transition-colors duration-200 hover:bg-gray-500"
        onMouseDown={handleMouseDown}
      >
        <div className="h-8 w-1 rounded-full bg-gray-400" />
      </div>

      <div
        className="flex h-full flex-col overflow-y-auto bg-gray-800 p-6"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <CollaborationEditor matchId={matchId} />
      </div>
    </div>
  );
}

const CollaborationPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CollaborationPageContent />
    </Suspense>
  );
};

export default CollaborationPage;
