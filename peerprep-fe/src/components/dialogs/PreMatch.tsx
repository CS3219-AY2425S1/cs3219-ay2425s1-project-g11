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
import { sendMessageToQueue } from '@/lib/rabbitmq';
import { axiosAuthClient } from '@/network/axiosClient';
import { DIFFICULTY_OPTIONS } from '@/lib/constants';

export function PreMatch() {
  const [open, setOpen] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const router = useRouter();

  const handleConfirm = async () => {
    try {
      const profileDetails = await getProfileDetails();
      const message = {
        _id: profileDetails.id,
        name: profileDetails.username,
        topic: selectedTopics[0] || '', // TODO: change to list, but current backend only accepts 1
        // topic: selectedTopics.join(','),
        difficulty: difficulty,
        type: "match",
      };
      await sendMessageToQueue(message);
      setOpen(false);
      router.push('/match');
    } catch (err) {
      console.error('Error in handleConfirm:', err);
    }
  };

  const getProfileDetails = async () => {
    const result = await axiosAuthClient.get('/auth/verify-token');
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
      <DialogContent className="sm:max-w-[425px]">
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
