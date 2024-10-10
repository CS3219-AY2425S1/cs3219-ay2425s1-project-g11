import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProblemDialogData } from '@/types/types';

export default function ProblemDialog({
  isOpen,
  onClose,
  problem,
}: {
  isOpen: boolean;
  onClose: () => void;
  problem: ProblemDialogData | null;
}) {
  if (!problem) return null;

  const difficultyText =
    problem.difficulty === 1
      ? 'Easy'
      : problem.difficulty === 2
        ? 'Medium'
        : 'Hard';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black">
        <DialogHeader>
          <DialogTitle>{problem.title}</DialogTitle>
          <DialogDescription>Difficulty: {difficultyText}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="mb-2 text-lg font-semibold">Description:</h3>
          <p>{problem.description}</p>
        </div>
        <div className="mt-6 flex justify-end">
          {/* TODO: link to match route/page */}
          <Button variant="secondary">Match</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
