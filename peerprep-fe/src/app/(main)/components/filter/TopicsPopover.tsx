'use client';
import { useState, useEffect } from 'react';
import { axiosClient } from '@/network/axiosClient';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TopicsPopoverProps {
  selectedTopics: string[];
  onChange: (value: string[]) => void;
  isAdmin?: boolean;
  multiselect: boolean;
}

export function TopicsPopover({
  selectedTopics,
  onChange,
  isAdmin,
  multiselect,
}: TopicsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axiosClient.get('/questions/tags');
        setTopics(response.data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  const filteredTopics = topics.filter((topic) =>
    topic.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleTopicSelection = (selectedTopic: string) => {
    if (multiselect) {
      // Multiple selection mode
      const newSelectedTopics = selectedTopics.includes(selectedTopic)
        ? selectedTopics.filter((t) => t !== selectedTopic)
        : [...selectedTopics, selectedTopic];
      onChange(newSelectedTopics);
    } else {
      // Single selection mode
      const newSelectedTopics = selectedTopics.includes(selectedTopic)
        ? [] // Deselect if clicking the same topic
        : [selectedTopic]; // Select only the clicked topic
      onChange(newSelectedTopics);
      setOpen(false); // Close popover after selection in single select mode
    }
  };

  const getButtonText = () => {
    if (selectedTopics.length === 0) return 'Select topics';
    if (!multiselect) return selectedTopics[0];
    return `${selectedTopics.length} topics selected`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between border-gray-700 bg-gray-800"
        >
          {getButtonText()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="flex gap-1 p-2">
          <Input
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => {
              e.stopPropagation();
              setSearchTerm(e.target.value);
            }}
            className="mb-2"
          />
          {isAdmin && (
            <Button
              onClick={async () => {
                if (!searchTerm.trim()) return;
                setTopics((prev) => [...prev, searchTerm]);
                setSearchTerm('');
              }}
              className="p-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px] overflow-y-auto">
          {filteredTopics.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">No topic found.</p>
          ) : (
            <div className="grid gap-1 p-2">
              {filteredTopics.map((topic) => (
                <Button
                  key={topic}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleTopicSelection(topic)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedTopics.includes(topic)
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  {topic}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
