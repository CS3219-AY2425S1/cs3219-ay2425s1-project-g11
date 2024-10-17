import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  description: string;
  callback?: () => void;
  callbackTitle?: string;
};

const ActionDialog = ({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  callback,
  callbackTitle,
}: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <h3 className="mb-2 text-lg font-semibold">Description:</h3>
          <p>{description}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={callback}>
            {callbackTitle}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActionDialog;
