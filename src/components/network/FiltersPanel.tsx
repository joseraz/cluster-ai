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
      className="absolute top-20 right-6 z-10 rounded-xl p-4 flex flex-col gap-3 min-w-[220px] shadow-lg"
      style={{ background: 'rgba(46,40,35,0.85)', border: '1px solid rgba(201,169,110,0.20)' }}
    >
      <p className="text-foreground text-xs font-semibold uppercase tracking-wider">Filters</p>

      <Select
        value={filters.location}
        onValueChange={val => onFiltersChange({ ...filters, location: val })}
      >
        <SelectTrigger className="h-8 text-xs bg-primary/10 border-primary/20 text-foreground">
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
        <SelectTrigger className="h-8 text-xs bg-primary/10 border-primary/20 text-foreground">
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
          className="text-muted-foreground hover:text-foreground hover:bg-primary/10 h-7 text-xs"
          onClick={() => onFiltersChange({ location: 'all', connectionType: 'all' })}
        >
          Reset filters
        </Button>
      )}
    </div>
  );
}
