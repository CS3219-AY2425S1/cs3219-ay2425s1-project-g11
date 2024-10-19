'use client';
import React, { useState } from 'react';
import { useFilteredProblems } from '@/hooks/useFilteredProblems';
import FilterBar from '../(main)/components/filter/FilterBar';
import ProblemTable from '../../components/problems/ProblemTable';
import { axiosQuestionClient } from '@/network/axiosClient';
import { Problem } from '@/types/types';
import { isAxiosError } from 'axios';
import ProblemInputDialog from '@/components/problems/ProblemInputDialog';
import InformationDialog from '@/components/dialogs/InformationDialog';

function AdminPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [informationDialog, setInformationDialog] = useState('');
  const {
    problems,
    filters,
    updateFilter,
    removeFilter,
    isLoading,
    refetchFilter,
  } = useFilteredProblems();

  const handleDelete = async (id: number) => {
    const res = await axiosQuestionClient.delete(`/questions/${id}`);
    if (res.status !== 200) {
      throw new Error('Failed to delete problem');
    }
    refetchFilter();
    return res;
  };

  const handleEdit = async (problem: Problem) => {
    try {
      const res = await axiosQuestionClient.put(`/questions/${problem._id}`, {
        difficulty: problem.difficulty,
        description: problem.description,
        examples: problem.examples,
        constraints: problem.constraints,
        tags: problem.tags,
        title_slug: problem.title_slug,
        title: problem.title,
      });

      refetchFilter();
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
    // TODO: Add proper validation of fields
    if (
      problem.description === '' ||
      problem.title === '' ||
      problem.tags.length === 0
    ) {
      setInformationDialog('Please fill in all required fields');
      return;
    }
    try {
      const res = await axiosQuestionClient.post(`/questions`, {
        difficulty: problem.difficulty,
        description: problem.description,
        examples: problem.examples,
        constraints: problem.constraints,
        tags: problem.tags,
        title_slug: problem.title_slug,
        title: problem.title,
      });

      refetchFilter();
      setIsAddDialogOpen(false);
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
          showActions={true}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
        />
      </div>
      <ProblemInputDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
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
