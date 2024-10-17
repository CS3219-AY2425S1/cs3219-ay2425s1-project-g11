'use client';
import { useFilteredProblems } from '@/hooks/useFilteredProblems';
import FilterBar from './filter/FilterBar';
import ProblemTable from '../../../components/problems/ProblemTable';

export default function MainComponent() {
  const { problems, filters, updateFilter, removeFilter, isLoading } =
    useFilteredProblems();

  return (
    <div className="min-h-screen bg-gray-900 p-6 pt-24 text-gray-100">
      <div className="mx-auto max-w-7xl">
        <FilterBar
          filters={filters}
          updateFilter={updateFilter}
          removeFilter={removeFilter}
        />
        <ProblemTable problems={problems} isLoading={isLoading} />
      </div>
    </div>
  );
}
