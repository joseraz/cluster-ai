import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { PanelLeftClose, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OrbitalCanvas } from '@/components/network/OrbitalCanvas';
import { ContactSheet } from '@/components/contacts/ContactSheet';
import { useContacts } from '@/contexts/ContactsContext';
import { useSearch } from '@/contexts/SearchContext';

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function ContactsView() {
  const { contacts, isLoading, loadSeedData } = useContacts();
  const { searchQuery, searchResults } = useSearch();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

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

  // When a global search is active, filter using its results;
  // otherwise show all contacts (trimmed to ids for O(1) lookup).
  const resultIds = searchResults
    ? new Set(searchResults.map(r => r.contact.id))
    : null;

  const filtered = contacts.filter(c => {
    if (resultIds) return resultIds.has(c.id);
    // No active search — show all
    return true;
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
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            Contacts
            {searchQuery && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                — {filtered.length} matched
              </span>
            )}
          </span>
          <button
            onClick={() => setPanelOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            title="Collapse panel"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state — no contacts at all */}
          {!isLoading && contacts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-center">
              <p className="text-sm text-muted-foreground">No contacts yet</p>
              {import.meta.env.DEV && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadSeedData}
                  className="text-xs"
                >
                  Load sample data
                </Button>
              )}
            </div>
          )}

          {/* No search results */}
          {!isLoading && contacts.length > 0 && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8 px-4 whitespace-nowrap">
              No contacts found
            </p>
          )}

          {/* Contact list */}
          {!isLoading && filtered.map(contact => (
            <div
              key={contact.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50"
            >
              <Avatar className="w-9 h-9 flex-shrink-0">
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
          ))}
        </div>
      </div>

      {/* Right: canvas */}
      <div className="flex-1 relative overflow-hidden">
        <OrbitalCanvas
          onCreateContact={() => setSheetOpen(true)}
          searchResults={searchResults}
          queryTokens={searchQuery ? searchQuery.split(' ').filter(Boolean) : []}
        />
      </div>

      <ContactSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
