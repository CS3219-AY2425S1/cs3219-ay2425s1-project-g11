import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description: string;
};

const InformationDialog = ({ isOpen, onClose, title, description }: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="mt-4">
          <p>{description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InformationDialog;
