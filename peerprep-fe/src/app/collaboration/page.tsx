'use client';

import ProblemDescriptionPanel from '@/components/problems/ProblemDescriptionPanel';
import ProblemTable from '@/components/problems/ProblemTable';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFilteredProblems } from '@/hooks/useFilteredProblems';
import { DEFAULT_CODE, SUPPORTED_PROGRAMMING_LANGUAGES } from '@/lib/constants';
import { Problem } from '@/types/types';
import { UserCircle } from 'lucide-react';
import React, { useState } from 'react';

const CollaborationPage = () => {
  const [selectionProblem, setSelectionProblem] = useState<Problem | null>(
    null,
  );
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState(SUPPORTED_PROGRAMMING_LANGUAGES[0]);
  const { problems, isLoading } = useFilteredProblems();

  const handleCallback = (id: number) => {
    const problem = problems.find((p) => p._id === id);
    if (problem) {
      setSelectionProblem(problem);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 p-6 pt-24 text-gray-100">
      {selectionProblem ? (
        <div className="w-1/2 overflow-y-auto p-6">
          <ProblemDescriptionPanel
            problem={selectionProblem}
            resetQuestion={() => setSelectionProblem(null)}
          />
        </div>
      ) : (
        <div className="w-1/2 overflow-y-auto p-6">
          <h2 className="mb-4 text-2xl font-bold">Choose a question</h2>
          <ProblemTable
            problems={problems}
            isLoading={isLoading}
            rowCallback={handleCallback}
          />
        </div>
      )}

      <div className="flex w-1/2 flex-col bg-gray-800 p-6">
        <div className="flex justify-between">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="mb-4 w-32">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_PROGRAMMING_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-full"
              onClick={() => {
                console.log('Clicked user');
              }}
            >
              <UserCircle className="h-6 w-6 text-gray-300" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-full"
              onClick={() => {
                console.log('Clicked user');
              }}
            >
              <UserCircle className="h-6 w-6 text-gray-300" />
            </Button>
          </div>
        </div>

        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mb-4 flex-grow bg-gray-900 font-mono text-gray-100"
          style={{ resize: 'none' }}
        />
      </div>
    </div>
  );
};

export default CollaborationPage;
