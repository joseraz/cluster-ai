
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function NetworkSearchBar({ searchTerm, onSearch, onClear }) {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2 min-w-96">
        <Search className="w-4 h-4 text-gray-400 ml-2" />
        <Input
          placeholder="Search contacts by name or company..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="border-0 focus-visible:ring-0 bg-transparent flex-1"
        />
        <Button 
          size="sm" 
          variant="ghost" 
          className="p-1"
          onClick={onClear}
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
