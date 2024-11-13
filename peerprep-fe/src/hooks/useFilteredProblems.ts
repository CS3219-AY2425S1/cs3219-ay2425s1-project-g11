import { useState, useCallback, useEffect, useRef } from 'react';
import { axiosClient } from '@/network/axiosClient';
import { Problem } from '@/types/types';

export interface FilterState {
  difficulty: string | null;
  status: string | null;
  topics: string[] | null;
  search: string | null;
}

const PAGE_SIZE = 20;

export function useFilteredProblems() {
  // States for both filtering and pagination
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    difficulty: null,
    status: null,
    topics: null,
    search: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const seenIds = useRef(new Set<number>());

  const fetchProblems = useCallback(
    async (pageNum: number, isLoadingMore = false) => {
      if (!isLoadingMore) {
        seenIds.current.clear();
      }

      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        params.append('page', pageNum.toString());
        params.append('limit', PAGE_SIZE.toString());

        // Apply filters to query
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.status) params.append('status', filters.status);
        if (filters.topics?.length) {
          filters.topics.forEach((topic) => params.append('topics', topic));
        }
        if (filters.search) params.append('search', filters.search);

        const url = `/questions?${params.toString()}`;
        const response = await axiosClient.get<Problem[]>(url);
        const newProblems = response.data;

        if (newProblems.length === 0) {
          setHasMore(false);
          return;
        }

        if (isLoadingMore) {
          console.log('Fetching a page of 20 items');
          const uniqueNewProblems: Problem[] = [];
          let foundDuplicate = false;

          for (const problem of newProblems) {
            if (seenIds.current.has(problem._id)) {
              foundDuplicate = true;
              break;
            }
            seenIds.current.add(problem._id);
            uniqueNewProblems.push(problem);
          }

          if (foundDuplicate || uniqueNewProblems.length === 0) {
            setHasMore(false);
          }

          setProblems((prev) => [...prev, ...uniqueNewProblems]);
        } else {
          newProblems.forEach((problem) => seenIds.current.add(problem._id));
          setProblems(newProblems);
          setHasMore(newProblems.length === PAGE_SIZE);
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  ); // Note filters dependency

  // Filter functions
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

  // Reset and fetch when filters change
  useEffect(() => {
    setPage(1);
    fetchProblems(1, false);
  }, [filters, fetchProblems]);

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProblems(nextPage, true);
    }
  }, [isLoading, hasMore, page, fetchProblems]);

  return {
    problems,
    filters,
    updateFilter,
    removeFilter,
    isLoading,
    hasMore,
    loadMore,
    fetchProblems,
  };
}
