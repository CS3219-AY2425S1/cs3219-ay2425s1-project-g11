interface Problem {
  _id: number;
  title: string;
  difficulty: number;
  description: string;
  examples: string[];
  constraints: string;
  tags: string[];
  title_slug: string;
  pictures?: File[];
}

interface ProblemDialogData {
  _id: number;
  title: string;
  difficulty: number;
  description: string;
}

interface FilterBadgeProps {
  filterType: 'Difficulty' | 'Status' | 'Topics';
  value: string;
  onRemove: (filterType: string, value: string) => void;
}

interface FilterSelectProps {
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  value: string | string[];
  isMulti?: boolean;
}

export type { Problem, ProblemDialogData, FilterBadgeProps, FilterSelectProps };
