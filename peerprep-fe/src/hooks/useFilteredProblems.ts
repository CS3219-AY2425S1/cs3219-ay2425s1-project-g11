import { useState, useCallback, useEffect, useRef } from 'react';
import { axiosClient } from '@/network/axiosClient';
import { Problem } from '@/types/types';

export interface FilterState {
  difficulty: string | null;
  status: string | null;
  topics: string[] | null;
  search: string | null;
}

interface PaginatedResponse {
  items: Problem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const PAGE_SIZE = 20;

export function useFilteredProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    difficulty: null,
    status: null,
    topics: null,
    search: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const seenIds = useRef(new Set<number>());
  const currentPage = useRef(1);

  const fetchProblems = useCallback(
    async (isLoadingMore = false) => {
      if (!isLoadingMore) {
        seenIds.current.clear();
        currentPage.current = 1;
        setIsEmpty(false);
      }

      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        params.append('page', currentPage.current.toString());
        params.append('limit', PAGE_SIZE.toString());

        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.status) params.append('status', filters.status);
        if (filters.topics?.length) {
          params.append('topics', filters.topics.join(','));
        }
        if (filters.search) params.append('search', filters.search);

        const url = `/questions?${params.toString()}`;
        const response = await axiosClient.get<PaginatedResponse>(url);
        const { items: newProblems } = response.data;

        if (!isLoadingMore && newProblems.length === 0) {
          setIsEmpty(true);
          setProblems([]);
          setHasMore(false);
          return;
        }

        if (isLoadingMore) {
          const uniqueNewProblems = newProblems.filter((problem) => {
            if (seenIds.current.has(problem._id)) {
              return false;
            }
            seenIds.current.add(problem._id);
            return true;
          });

          if (uniqueNewProblems.length === 0) {
            setHasMore(false);
            return;
          }

          setProblems((prev) => [...prev, ...uniqueNewProblems]);
          setHasMore(newProblems.length === PAGE_SIZE);
        } else {
          newProblems.forEach((problem) => seenIds.current.add(problem._id));
          setProblems(newProblems);
          setHasMore(newProblems.length === PAGE_SIZE);
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        setHasMore(false);
        if (!isLoadingMore) {
          setIsEmpty(true);
          setProblems([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

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

  useEffect(() => {
    fetchProblems(false);
  }, [filters, fetchProblems]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      currentPage.current += 1;
      fetchProblems(true);
    }
  }, [isLoading, hasMore, fetchProblems]);

  return {
    problems,
    filters,
    updateFilter,
    removeFilter,
    isLoading,
    hasMore,
    isEmpty,
    loadMore,
  };
}
