'use client';
import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Problem, ProblemDialogData } from '@/types/types';
import ProblemDialog from './ProblemDialog';

function ProblemStatus({ status }: { status: string }) {
  if (status === 'solved') {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  } else if (status === 'attempted') {
    return <div className="h-5 w-5 rounded-full border-2 border-yellow-500" />;
  }
  return null;
}

export default function ProblemRow({ problem }: { problem: Problem }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [problemDetails, setProblemDetails] =
    useState<ProblemDialogData | null>(null);

  const handleProblemClick = async () => {
    // Fetch problem details here (replace with actual API call)
    const details: ProblemDialogData = {
      question_id: problem.question_id,
      title: problem.title,
      difficulty: problem.difficulty,
      description: problem.description,
    };
    setProblemDetails(details);
    setIsDialogOpen(true);
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
          onClick={handleProblemClick}
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
          {problem.difficulty == 1
            ? 'Easy'
            : problem.difficulty == 2
              ? 'Medium'
              : 'Hard'}
        </td>
      </tr>
      <ProblemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        problem={problemDetails}
      />
    </>
  );
}
