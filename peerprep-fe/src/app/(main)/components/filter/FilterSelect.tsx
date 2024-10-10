import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { FilterSelectProps } from '@/types/types';

export function FilterSelect({
  placeholder,
  options,
  onChange,
  isMulti,
  value,
}: FilterSelectProps) {
  return (
    <Select
      onValueChange={onChange}
      {...(isMulti ? { multiple: true } : {})}
      value={isMulti ? undefined : (value as string)}
    >
      <SelectTrigger className="w-[120px] border-gray-700 bg-gray-800">
        {placeholder}
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
