import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Problem } from '@/types/types';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { FilterSelect } from '@/components/filter/FilterSelect';
import { TopicsPopover } from '@/components/filter/TopicsPopover';
import { DIFFICULTY_OPTIONS, INITIAL_PROBLEM_DATA } from '@/lib/constants';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  problem?: Problem;
  requestCallback: (problem: Problem) => void;
  requestTitle: string;
};

function ProblemInputDialog({
  isOpen,
  onClose,
  problem,
  requestCallback,
  requestTitle,
}: Props) {
  const [problemData, setProblemData] = useState<Problem>(
    problem || INITIAL_PROBLEM_DATA,
  );

  const handleSubmit = async () => {
    requestCallback(problemData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black">
        <DialogHeader>
          <DialogTitle>
            {problem ? 'Edit Question' : 'Add Question'}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <p>Title</p>
            <Input
              name="title"
              placeholder="Question Title"
              value={problemData.title}
              onChange={(e) => {
                setProblemData({ ...problemData, title: e.target.value });
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <p>Difficulty</p>
            <FilterSelect
              placeholder="difficulty"
              options={DIFFICULTY_OPTIONS}
              onChange={(value) => {
                setProblemData({ ...problemData, difficulty: Number(value) });
              }}
              value={String(problemData.difficulty)}
              showSelectedValue={true}
            />
          </div>
          <div className="space-y-2">
            <p>Description</p>
            <Textarea
              name="description"
              placeholder="Question Description"
              value={problemData.description}
              onChange={(e) => {
                setProblemData({ ...problemData, description: e.target.value });
              }}
              className="min-h-[100px]"
              required
            />
          </div>
          <div className="space-y-2">
            <p>Topics</p>
            <TopicsPopover
              multiselect={true}
              selectedTopics={problemData.tags}
              onChange={(value) => {
                setProblemData({ ...problemData, tags: value });
              }}
              isAdmin
            />
          </div>
          <div className="mt-2 flex justify-end">
            <Button variant="secondary" onClick={handleSubmit}>
              {requestTitle}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProblemInputDialog;
