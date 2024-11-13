'use client';
import React, { useState } from 'react';
import { useFilteredProblems } from '@/hooks/useFilteredProblems';
import FilterBar from '../../components/filter/FilterBar';
import ProblemTable from '../../components/problems/ProblemTable';
import { axiosClient } from '@/network/axiosClient';
import { Problem } from '@/types/types';
import { isAxiosError } from 'axios';
import ProblemInputDialog from '@/components/problems/ProblemInputDialog';
import InformationDialog from '@/components/dialogs/InformationDialog';
import { useQuestionStore } from '@/state/useQuestionStore';

function AdminPage() {
  const { dialogOpen, toggleDialogOpen } = useQuestionStore();
  const [informationDialog, setInformationDialog] = useState('');
  const {
    problems,
    filters,
    updateFilter,
    removeFilter,
    isLoading,
    hasMore,
    loadMore,
    fetchProblems,
  } = useFilteredProblems();

  const validateEntries = (problem: Problem) => {
    if (
      problem.description === '' ||
      problem.title === '' ||
      problem.tags.length === 0
    ) {
      setInformationDialog('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleDelete = async (id: number) => {
    const res = await axiosClient.delete(`/questions/${id}`);
    if (res.status !== 200) {
      throw new Error('Failed to delete problem');
    }
    await fetchProblems(1, false);
    return res;
  };

  const handleEdit = async (problem: Problem) => {
    try {
      if (!validateEntries(problem)) {
        throw new Error('Invalid problem entries');
      }
      const res = await axiosClient.put(`/questions/${problem._id}`, {
        difficulty: problem.difficulty,
        description: problem.description,
        examples: problem.examples,
        constraints: problem.constraints,
        tags: problem.tags,
        title_slug: problem.title_slug,
        title: problem.title,
      });

      await fetchProblems(1, false);
      return res;
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        switch (e.status) {
          case 400:
            throw new Error('Invalid question data. Please check your input.');
          case 409:
            throw new Error('Question already exists');
          case 404:
            throw new Error('Question not found');
          default:
            throw new Error('Failed to update question');
        }
      }
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  };

  const handleAdd = async (problem: Problem) => {
    try {
      if (!validateEntries(problem)) {
        throw new Error('Invalid problem entries');
      }
      const res = await axiosClient.post(`/questions`, {
        difficulty: problem.difficulty,
        description: problem.description,
        examples: problem.examples,
        constraints: problem.constraints,
        tags: problem.tags,
        title_slug: problem.title_slug,
        title: problem.title,
      });

      await fetchProblems(1, false);
      toggleDialogOpen();
      return res;
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        switch (e.status) {
          case 400:
            throw new Error('Invalid question data. Please check your input.');
          case 409:
            throw new Error('Question already exists');
          case 404:
            throw new Error('Question not found');
          default:
            throw new Error('Failed to update question');
        }
      }
      if (e instanceof Error) {
        throw new Error(e.message);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 pt-24 text-gray-100">
      <div className="mx-auto max-w-7xl">
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
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          showActions={true}
        />
      </div>
      <ProblemInputDialog
        isOpen={dialogOpen}
        onClose={toggleDialogOpen}
        requestCallback={handleAdd}
        requestTitle="Add"
      />

      <InformationDialog
        isOpen={informationDialog !== ''}
        onClose={() => setInformationDialog('')}
        title="Status"
        description={informationDialog}
      />
    </div>
  );
}

export default AdminPage;
