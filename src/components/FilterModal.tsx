import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Define interfaces for type safety
interface Filters {
  user: string[];
  places: string[];
  tags: string[];
}

interface FilterModalProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  trigger: React.ReactNode;
}

export function FilterModal({ filters, onFiltersChange, trigger }: FilterModalProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const filterOptions = {
    user: ['User'],
    places: ['Business', 'Restaurant', 'Park', 'Cafe', 'Office'],
    tags: ['Work', 'Personal', 'Family', 'Professional', 'Social', 'Project']
  };

  const handleFilterChange = (category: keyof Filters, value: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters: Filters = {
      user: [],
      places: [],
      tags: []
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Contacts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {Object.entries(filterOptions).map(([category, options]) => (
            <div key={category} className="space-y-3">
              <Label className="text-sm font-medium capitalize">
                {category === 'places' ? 'Places' : category}
              </Label>
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${category}-${option}`}
                      checked={localFilters[category as keyof Filters]?.includes(option) || false}
                      onCheckedChange={(checked) => 
                        handleFilterChange(category as keyof Filters, option, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`${category}-${option}`}
                      className="text-sm font-normal"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={clearFilters}>
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}