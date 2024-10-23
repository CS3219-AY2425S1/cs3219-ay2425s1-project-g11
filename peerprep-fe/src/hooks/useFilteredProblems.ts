import { useState, useCallback, useEffect } from 'react';
import { axiosClient } from '@/network/axiosClient';
import { Problem } from '@/types/types';

export interface FilterState {
  difficulty: string | null;
  status: string | null;
  topics: string[] | null;
  search: string | null;
}

export function useFilteredProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    difficulty: null,
    status: null,
    topics: null,
    search: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProblems = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.status) params.append('status', filters.status);
    if (filters.topics)
      filters.topics.forEach((topic) => params.append('topics', topic));
    if (filters.search) params.append('search', filters.search);
    try {
      const url = params.toString()
        ? `/questions?${params.toString()}`
        : '/questions';
      const response = await axiosClient.get(url);
      setProblems(response.data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const updateFilter = useCallback(
    (key: keyof FilterState, value: string | string[] | null) => {
      setFilters((prev) => ({
        ...prev,
        [key]:
          value === 'all' || (Array.isArray(value) && value.length === 0)
            ? null
            : value,
      }));
    },
    [],
  );

  const removeFilter = useCallback((key: keyof FilterState, value?: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]:
        key === 'topics' && value
          ? (prev.topics?.filter((t) => t !== value) ?? null)
          : null,
    }));
  }, []);

  const refetchFilter = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
    }));
  }, []);

  return {
    problems,
    filters,
    updateFilter,
    removeFilter,
    isLoading,
    refetchFilter,
  };
}
