import { useState } from 'react';
import { PanelLeftClose, Loader2 } from 'lucide-react';
import { OrbitalCanvas } from '@/components/network/OrbitalCanvas';
import { ContactSheet } from '@/components/contacts/ContactSheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSearch } from '@/contexts/SearchContext';
import { useContacts } from '@/contexts/ContactsContext';
import { useContactsPanel } from '@/contexts/ContactsPanelContext';
import type { Contact } from '@/types/contact';

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const NetworkView = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const { searchResults, queryTokens, searchQuery } = useSearch();
  const { contacts, isLoading, loadSeedData } = useContacts();
  const { panelOpen, closePanel } = useContactsPanel();

  const resultIds = searchResults
    ? new Set(searchResults.map(r => r.contact.id))
    : null;

  const filtered = contacts.filter(c => {
    if (resultIds) return resultIds.has(c.id);
    return true;
  });

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: contacts list panel */}
      <div
        className="flex-shrink-0 flex flex-col border-r border-border bg-background overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: panelOpen ? '320px' : '0px' }}
      >
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
            onClick={closePanel}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            title="Collapse panel"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && contacts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-center">
              <p className="text-sm text-muted-foreground">No contacts yet</p>
              {import.meta.env.DEV && (
                <Button size="sm" variant="outline" onClick={loadSeedData} className="text-xs">
                  Load sample data
                </Button>
              )}
            </div>
          )}

          {!isLoading && contacts.length > 0 && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8 px-4 whitespace-nowrap">
              No contacts found
            </p>
          )}

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
          onCreateContact={() => { setEditingContact(null); setSheetOpen(true); }}
          onEditContact={(contact) => { setEditingContact(contact); setSheetOpen(true); }}
          searchResults={searchResults}
          queryTokens={queryTokens}
        />
      </div>

      <ContactSheet
        open={sheetOpen}
        contact={editingContact}
        onClose={() => { setSheetOpen(false); setEditingContact(null); }}
      />
    </div>
  );
};

export default NetworkView;
