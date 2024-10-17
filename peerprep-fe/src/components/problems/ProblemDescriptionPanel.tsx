import { Problem } from '@/types/types';
import React from 'react';
import { Button } from '../ui/button';

type Props = {
  problem: Problem;
  resetQuestion: () => void; // replace with something more generic
};

const ProblemDescriptionPanel = ({ problem, resetQuestion }: Props) => {
  return (
    <>
      <div className="flex justify-between">
        <h2 className="mb-4 text-2xl font-bold">{problem.title}</h2>
        <Button
          variant="outline"
          className="border-gray-700 bg-gray-800"
          onClick={() => resetQuestion()}
        >
          Reset
        </Button>
      </div>
      <p className="mb-4">{problem.description}</p>
      {problem.examples.map((example, index) => (
        <React.Fragment key={index}>
          <h3 className="mb-2 text-xl font-semibold">Example {index + 1}:</h3>
          <pre className="mb-4 text-wrap rounded bg-gray-800 p-4">
            {example}
          </pre>
        </React.Fragment>
      ))}
      <h3 className="mb-2 text-xl font-semibold">Constraints:</h3>
      <p>{problem.constraints ?? 'None'}</p>
    </>
  );
};

export default ProblemDescriptionPanel;
