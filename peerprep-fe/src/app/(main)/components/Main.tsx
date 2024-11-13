'use client';
import { useFilteredProblems } from '@/hooks/useFilteredProblems';
import FilterBar from '../../../components/filter/FilterBar';
import ProblemTable from '../../../components/problems/ProblemTable';
import RejoinSession from './RejoinSession';

export default function MainComponent() {
  const {
    problems,
    filters,
    updateFilter,
    removeFilter,
    isLoading,
    hasMore,
    loadMore,
  } = useFilteredProblems();

  return (
    <div className="min-h-screen bg-gray-900 p-6 pt-24 text-gray-100">
      <div className="mx-auto max-w-7xl">
        <RejoinSession />
        <FilterBar
          filters={filters}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <ProblemTable
          problems={problems}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
}
