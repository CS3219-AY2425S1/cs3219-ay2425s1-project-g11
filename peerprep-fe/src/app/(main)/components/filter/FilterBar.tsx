'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useSearchStore } from '@/state/useSearchStore';
import { FilterSelect } from './FilterSelect';
import { FilterBadge } from './FilterBadge';

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Todo' },
  { value: 'solved', label: 'Solved' },
];

// TODO: replace with backend fetched list
const TOPIC_OPTIONS = [
  { value: 'array', label: 'Array' },
  { value: 'string', label: 'String' },
  { value: 'dp', label: 'Dynamic Programming' },
];

export default function FilterBar() {
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: string | string[];
  }>({});
  const { searchTerm, setSearchTerm } = useSearchStore();

  const handleFilterChange = useCallback((key: string, value: string) => {
    setSelectedFilters((prev) => {
      if (key === 'topics') {
        const topics = (prev.topics as string[]) || [];
        if (topics.includes(value)) {
          return { ...prev, topics: topics.filter((t) => t !== value) };
        } else {
          return { ...prev, topics: [...topics, value] };
        }
      }
      return { ...prev, [key]: value };
    });

    // TODO: call backend to update filters and then update the list of questions
  }, []);

  const removeFilter = useCallback((key: string, value?: string) => {
    setSelectedFilters((prev) => {
      if (key === 'topics' && value) {
        const topics = prev.topics as string[];
        return { ...prev, topics: topics.filter((t) => t !== value) };
      }
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });

    // TODO: call backend to update filters and then update the list of questions
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);

    // TODO: call backend to update search term and then update the list of questions
    // Currently, the list of questions is updated immediately using `zustand` global state
  };

  // sort the filter badges by the order of the filter types
  // order of: difficulty, status, topics
  const sortedBadges = () => {
    const order = ['difficulty', 'status', 'topics'];
    return Object.entries(selectedFilters)
      .flatMap(([filterType, values]) =>
        Array.isArray(values)
          ? values.map((value) => ({ filterType, value }))
          : [{ filterType, value: values as string }],
      )
      .filter(({ value }) => value !== 'all')
      .sort(
        (a, b) => order.indexOf(a.filterType) - order.indexOf(b.filterType),
      );
  };

  return (
    <div className="mb-6">
      <div className="mb-4 flex flex-wrap gap-4">
        <FilterSelect
          placeholder="Difficulty"
          options={DIFFICULTY_OPTIONS}
          onChange={(value) => handleFilterChange('difficulty', value)}
          value={(selectedFilters.difficulty as string) || ''}
        />
        <FilterSelect
          placeholder="Status"
          options={STATUS_OPTIONS}
          onChange={(value) => handleFilterChange('status', value)}
          value={(selectedFilters.status as string) || ''}
        />
        <FilterSelect
          placeholder="Topics"
          options={TOPIC_OPTIONS}
          onChange={(value) => handleFilterChange('topics', value)}
          value={(selectedFilters.topics as string[]) || []}
          isMulti
        />
        <div className="flex-grow">
          <Input
            className="w-full border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400"
            placeholder="Search questions"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="border-gray-700 bg-gray-800"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button className="bg-green-600 text-white hover:bg-green-700">
          Match
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sortedBadges().map(({ filterType, value }) => (
          <FilterBadge
            key={`${filterType}-${value}`}
            filterType={filterType as 'difficulty' | 'status' | 'topics'}
            value={value}
            onRemove={removeFilter}
          />
        ))}
      </div>
    </div>
  );
}
