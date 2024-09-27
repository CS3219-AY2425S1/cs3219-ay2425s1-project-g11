import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { FilterBadgeProps } from '@/types/types';
import { cn } from '@/lib/utils';

export function FilterBadge({ filterType, value, onRemove }: FilterBadgeProps) {
  const getBadgeColor = () => {
    switch (filterType) {
      case 'difficulty':
        return value === 'easy'
          ? 'bg-green-600'
          : value === 'medium'
            ? 'bg-yellow-600'
            : value === 'hard'
              ? 'bg-red-600'
              : 'bg-gray-600';
      case 'status':
        return value === 'todo'
          ? 'bg-yellow-600'
          : value === 'solved'
            ? 'bg-green-600'
            : 'bg-gray-600';
      case 'topics':
        return 'bg-indigo-600';
    }
  };

  return (
    <Badge
      variant="secondary"
      hover={false}
      className={cn('pr-1', getBadgeColor())}
    >
      {`${filterType}: ${value}`}
      <button
        onClick={() => onRemove(filterType, value)}
        className="ml-1 focus:outline-none"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
