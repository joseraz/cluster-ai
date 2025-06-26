
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const FilterModal = ({ filters, onFiltersChange, trigger }) => {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleFilterChange = (category, value, checked) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }));
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
          <div>
            <h4 className="font-medium mb-3">Categories</h4>
            <div className="space-y-2">
              {['business', 'personal'].map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={localFilters.user.includes(category)}
                    onCheckedChange={(checked) => handleFilterChange('user', category, checked)}
                  />
                  <Label htmlFor={category} className="capitalize">{category}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Tags</h4>
            <div className="space-y-2">
              {['work', 'professional', 'startup', 'tech', 'personal'].map(tag => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={localFilters.tags.includes(tag)}
                    onCheckedChange={(checked) => handleFilterChange('tags', tag, checked)}
                  />
                  <Label htmlFor={tag} className="capitalize">{tag}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
