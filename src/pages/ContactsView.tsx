import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, PanelLeftClose } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OrbitalCanvas } from '@/components/network/OrbitalCanvas';
import { CreateContactSheet } from '@/components/contacts/CreateContactSheet';
import { useContacts } from '@/contexts/ContactsContext';

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function ContactsView() {
  const { contacts } = useContacts();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(
    () => !!(location.state as { togglePanel?: boolean })?.togglePanel
  );

  const skipFirstToggle = useRef(true);

  useEffect(() => {
    if (skipFirstToggle.current) {
      skipFirstToggle.current = false;
      return;
    }
    if ((location.state as { togglePanel?: boolean })?.togglePanel) {
      setPanelOpen(prev => !prev);
    }
  }, [location]);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.livesIn?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: contacts list panel */}
      <div
        className="flex-shrink-0 flex flex-col border-r border-border bg-background overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: panelOpen ? '320px' : '0px' }}
      >
        {/* Panel header with collapse toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">Contacts</span>
          <button
            onClick={() => setPanelOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            title="Collapse panel"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 px-4 whitespace-nowrap">No contacts found</p>
          ) : (
            filtered.map(contact => (
              <div
                key={contact.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50"
              >
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarImage src={contact.profileImage} alt={`${contact.firstName} ${contact.lastName}`} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {getInitials(contact.firstName, contact.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {contact.firstName} {contact.lastName}
                  </p>
                  {contact.livesIn && (
                    <p className="text-xs text-muted-foreground truncate">{contact.livesIn}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: canvas */}
      <div className="flex-1 relative overflow-hidden">
        <OrbitalCanvas onCreateContact={() => setSheetOpen(true)} />
      </div>

      <CreateContactSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
