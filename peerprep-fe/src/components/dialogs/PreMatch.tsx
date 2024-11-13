'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FilterSelect } from '@/app/(main)/components/filter/FilterSelect';
import { TopicsPopover } from '@/app/(main)/components/filter/TopicsPopover';
import { axiosClient } from '@/network/axiosClient';
import { DIFFICULTY_OPTIONS } from '@/lib/constants';
import { UserMatchingRequest } from '@/types/types';

export function PreMatch() {
  const [open, setOpen] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const router = useRouter();

  const handleConfirm = async () => {
    try {
      const profileDetails = await getProfileDetails();
      const message: UserMatchingRequest = {
        _id: profileDetails.id,
        name: profileDetails.username,
        topic: selectedTopics[0] || '',
        difficulty: difficulty,
        type: 'match',
      };
      await axiosClient.post('/matching/send', message);
      setOpen(false);
      router.push('/match');
    } catch (err) {
      console.error('Error in handleConfirm:', err);
    }
  };

  const getProfileDetails = async () => {
    const result = await axiosClient.get('/auth/verify-token');
    return result.data.data;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-gray-300 hover:bg-black hover:text-white"
        >
          Match
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Match Preferences</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <label htmlFor="difficulty" className="text-right">
              Difficulty:
            </label>
            <FilterSelect
              placeholder="Difficulty"
              options={DIFFICULTY_OPTIONS}
              onChange={(value) => setDifficulty(value)}
              value={difficulty}
              showSelectedValue={true}
            />
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="topics" className="text-right">
              Topics:
            </label>
            <TopicsPopover
              selectedTopics={selectedTopics}
              onChange={setSelectedTopics}
              multiselect={false}
            />
          </div>
        </div>
        <Button
          onClick={handleConfirm}
          disabled={!difficulty || selectedTopics.length === 0}
        >
          Confirm and Match
        </Button>
      </DialogContent>
    </Dialog>
  );
}
