'use client';
import React, { useState } from 'react';
import { CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { Problem } from '@/types/types';
import { Button } from '../ui/button';
import { getDifficultyString } from '@/lib/utils';
import ProblemInputDialog from './ProblemInputDialog';
import { AxiosResponse } from 'axios';
import InformationDialog from '../dialogs/InformationDialog';
import ActionDialog from '../dialogs/ActionDialog';

function ProblemStatus({ status }: { status: string }) {
  if (status === 'solved') {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  } else if (status === 'attempted') {
    return <div className="h-5 w-5 rounded-full border-2 border-yellow-500" />;
  }
  return null;
}

interface Props {
  problem: Problem;
  showActions: boolean;
  handleDelete:
    | ((id: number) => Promise<AxiosResponse<unknown, unknown>>)
    | undefined;
  handleEdit:
    | ((problem: Problem) => Promise<AxiosResponse<unknown, unknown>>)
    | undefined;
  rowCallback?: (id: number) => void;
}

export default function ProblemRow({
  problem,
  showActions,
  handleDelete,
  handleEdit,
  rowCallback,
}: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [informationDialog, setInformationDialog] = useState('');

  const handleDeleteClick = async () => {
    if (!handleDelete) return;
    handleDelete(problem._id).catch(() => {
      setInformationDialog('Failed to delete problem');
    });
  };

  const handleEditClick = async (problemData: Problem) => {
    if (!handleEdit) return;
    if (problemData === problem) {
      setInformationDialog('No changes made');
      return;
    }

    handleEdit(problemData).catch((e: Error) => {
      setInformationDialog(e.message);
    });
  };

  return (
    <>
      <tr className="border-b border-gray-800">
        <td className="w-28 px-4 py-2">
          {/* TODO: change to user status for this question */}
          <ProblemStatus status={'unsolved'} />
        </td>
        <td
          className="cursor-pointer px-4 py-2 font-medium transition-colors hover:text-blue-500"
          onClick={
            rowCallback
              ? () => rowCallback(problem._id)
              : () => setIsDialogOpen(true)
          }
        >
          {problem.title}
        </td>
        <td className="px-4 py-2">
          {problem.tags.map((tag, index) => (
            <span
              key={index}
              className="mb-1 mr-1 inline-block rounded-full bg-gray-700 px-2 py-1 text-xs font-semibold text-gray-300"
            >
              {tag}
            </span>
          ))}
        </td>
        <td
          className={`px-4 py-2 ${
            problem.difficulty == 1
              ? 'text-green-500'
              : problem.difficulty == 2
                ? 'text-yellow-500'
                : 'text-red-500'
          }`}
        >
          {getDifficultyString(problem.difficulty)}
        </td>

        {showActions && (
          <td className="cursor-pointer space-x-2 px-4 py-2 font-medium transition-colors hover:text-blue-500">
            <Button
              variant="outline"
              size="icon"
              className="border-gray-700 bg-gray-800"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-gray-700 bg-gray-800"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </td>
        )}
      </tr>

      {/* Dialog for question description */}
      <ActionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={problem.title}
        subtitle={'Difficulty: ' + getDifficultyString(problem.difficulty)}
        description={problem.description}
        // TODO: add match callback
        callback={() => console.log('Match clicked')}
        callbackTitle="Match"
      />
      {/* Dialog for deleting question */}
      <ActionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Delete"
        description={`Are you sure you want to delete \"${problem.title}\"?`}
        callback={() => {
          setIsDeleteDialogOpen(false);
          handleDeleteClick();
        }}
        callbackTitle="Delete"
      />

      {/* dialog for editing question */}
      <ProblemInputDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        problem={problem}
        requestCallback={handleEditClick}
        requestTitle="Update"
      />

      {/* Dialog for any status/error information */}
      <InformationDialog
        isOpen={informationDialog !== ''}
        onClose={() => setInformationDialog('')}
        title="Status"
        description={informationDialog}
      />
    </>
  );
}
