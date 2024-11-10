'use client';
import { Input } from '@/components/ui/input';
import { FilterSelect } from './FilterSelect';
import { FilterBadge } from './FilterBadge';
import { TopicsPopover } from './TopicsPopover';
import { FilterState } from '@/hooks/useFilteredProblems';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { DIFFICULTY_OPTIONS } from '@/lib/constants';

interface FilterBarProps {
  filters: FilterState;
  updateFilter: (
    key: keyof FilterState,
    value: string | string[] | null,
  ) => void;
  removeFilter: (key: keyof FilterState, value?: string) => void;
}

export default function FilterBar({
  filters,
  updateFilter,
  removeFilter,
}: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay

  /**
   * Debounce so that search filters does not call backend for
   * every single character input, but only after 300ms of no input
   */
  useEffect(() => {
    updateFilter('search', debouncedSearchTerm);
  }, [debouncedSearchTerm, updateFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="mb-6">
      <div className="mb-4 flex flex-wrap gap-4">
        <FilterSelect
          placeholder="Difficulty"
          options={DIFFICULTY_OPTIONS}
          onChange={(value) => updateFilter('difficulty', value)}
          value={filters.difficulty || ''}
        />
        <TopicsPopover
          selectedTopics={filters.topics || []}
          onChange={(value) => updateFilter('topics', value)}
        />
        <div className="flex-grow">
          <Input
            className="w-full border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400"
            placeholder="Search questions"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.difficulty && (
          <FilterBadge
            filterType="Difficulty"
            value={
              DIFFICULTY_OPTIONS.find((opt) => opt.value === filters.difficulty)
                ?.label || ''
            }
            onRemove={() => removeFilter('difficulty')}
          />
        )}
        {filters.topics &&
          filters.topics.map((topic) => (
            <FilterBadge
              key={`topics-${topic}`}
              filterType="Topics"
              value={topic}
              onRemove={() => removeFilter('topics', topic)}
            />
          ))}
      </div>
    </div>
  );
}
