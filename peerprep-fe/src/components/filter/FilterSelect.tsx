import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterSelectProps } from '@/types/types';

export function FilterSelect({
  placeholder,
  options,
  onChange,
  isMulti,
  value,
  showSelectedValue = false, // New prop to control the display behavior
}: FilterSelectProps & { showSelectedValue?: boolean }) {
  return (
    <Select
      onValueChange={onChange}
      {...(isMulti ? { multiple: true } : {})}
      value={isMulti ? undefined : (value as string)}
    >
      <SelectTrigger className="w-[120px] border-gray-700 bg-gray-800">
        {showSelectedValue ? (
          <SelectValue placeholder={placeholder} />
        ) : (
          placeholder
        )}
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
