import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useContacts } from '@/contexts/ContactsContext';

interface FiltersPanelProps {
  filters: { location: string; connectionType: string };
  onFiltersChange: (filters: { location: string; connectionType: string }) => void;
}

export function FiltersPanel({ filters, onFiltersChange }: FiltersPanelProps) {
  const { contacts } = useContacts();

  const locations = Array.from(new Set(contacts.map(c => c.livesIn).filter(Boolean))) as string[];
  const connectionTypes = Array.from(new Set(contacts.map(c => c.connectionType).filter(Boolean))) as string[];

  const hasFilters = filters.location !== 'all' || filters.connectionType !== 'all';

  return (
    <div
      className="absolute top-6 right-6 z-10 rounded-xl p-4 flex flex-col gap-3 min-w-[220px] shadow-lg"
      style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}
    >
      <p className="text-white text-xs font-semibold uppercase tracking-wider">Filters</p>

      <Select
        value={filters.location}
        onValueChange={val => onFiltersChange({ ...filters, location: val })}
      >
        <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All locations</SelectItem>
          {locations.map(loc => (
            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.connectionType}
        onValueChange={val => onFiltersChange({ ...filters, connectionType: val })}
      >
        <SelectTrigger className="h-8 text-xs bg-white/10 border-white/20 text-white">
          <SelectValue placeholder="Connection type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {connectionTypes.map(type => (
            <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-white/10 h-7 text-xs"
          onClick={() => onFiltersChange({ location: 'all', connectionType: 'all' })}
        >
          Reset filters
        </Button>
      )}
    </div>
  );
}
