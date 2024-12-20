import { Problem } from '@/types/types';

export const DIFFICULTY_OPTIONS = [
  { value: '1', label: 'Easy' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'Hard' },
];

export const STATUS_OPTIONS = [
  { value: 'todo', label: 'Todo' },
  { value: 'solved', label: 'Solved' },
];

export const INITIAL_PROBLEM_DATA: Problem = {
  _id: Math.floor(Math.random() * 10000), // Generate a temporary ID for new problems
  title: '',
  difficulty: 1, // Set a default difficulty
  description: '',
  examples: [],
  constraints: '',
  tags: [],
  title_slug: '',
};

export const SUPPORTED_PROGRAMMING_LANGUAGES = ['Python', 'Java', 'C++'];

export const LANGUAGE_VERSIONS: { [key: string]: string } = {
  python: '3.10.0',
  java: '15.0.2',
  'c++': '10.2.0',
};

export const LANGUAGE_EXTENSION: { [key: string]: string } = {
  python: 'py',
  java: 'java',
  'c++': 'cpp',
};

export const PASSWORD_RULES = {
  minLength: 8,
};

// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
