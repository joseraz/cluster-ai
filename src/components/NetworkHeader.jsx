
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, Filter } from "lucide-react";

export function NetworkHeader({ onAddContact }) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-900">Network View</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          size="sm" 
          className="bg-[#0077B5] hover:bg-[#005885] text-white"
          onClick={onAddContact}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
        <Button size="sm" variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
    </div>
  );
}
