'use client';
import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Problem } from '@/types/types';
import { Button } from '../ui/button';
import { getDifficultyString } from '@/lib/utils';
import ProblemInputDialog from './ProblemInputDialog';
import { AxiosResponse } from 'axios';
import InformationDialog from '../dialogs/InformationDialog';
import ActionDialog from '../dialogs/ActionDialog';
import { useRouter } from 'next/navigation';
import { axiosClient } from '@/network/axiosClient';
import ProblemDescriptionPanel from './ProblemDescriptionPanel';

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
  const router = useRouter();

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

  const handleMatch = async () => {
    try {
      const profileDetails = await getProfileDetails();
      const message = {
        _id: profileDetails.id,
        name: profileDetails.username,
        topic: problem.tags[0],
        difficulty: problem.difficulty,
        type: 'match',
      };
      await axiosClient.post('/matching/send', message);
      router.push('/match');
    } catch (err) {
      console.error('Error in handleMatch:', err);
    }
  };

  const getProfileDetails = async () => {
    const result = await axiosClient.get('/auth/verify-token');
    return result.data.data;
  };

  return (
    <>
      <tr className="border-b border-gray-800">
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
        callback={handleMatch}
        callbackTitle="Match"
      >
        <ProblemDescriptionPanel
          problem={problem}
          resetQuestion={() => {}}
          hasHeader={false}
        />
      </ActionDialog>

      {/* Dialog for deleting question */}
      <ActionDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Delete"
        description={`Are you sure you want to delete \"${problem.title}\"?`}
        callback={() => {
          handleDeleteClick();
          setIsDeleteDialogOpen(false);
        }}
        callbackTitle="Delete"
      />

      {/* dialog for editing question */}
      <ProblemInputDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        problem={problem}
        requestCallback={(problem) => {
          handleEditClick(problem);
          setIsEditDialogOpen(false);
        }}
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
