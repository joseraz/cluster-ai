import { useState } from 'react';
import { OrbitalCanvas } from '@/components/network/OrbitalCanvas';
import { ContactSheet } from '@/components/contacts/ContactSheet';
import { useSearch } from '@/contexts/SearchContext';
import type { Contact } from '@/types/contact';

const NetworkView = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const { searchResults, queryTokens } = useSearch();

  return (
    <div className="h-full w-full relative">
      <OrbitalCanvas
        onCreateContact={() => { setEditingContact(null); setSheetOpen(true); }}
        onEditContact={(contact) => { setEditingContact(contact); setSheetOpen(true); }}
        searchResults={searchResults}
        queryTokens={queryTokens}
      />
      <ContactSheet
        open={sheetOpen}
        contact={editingContact}
        onClose={() => { setSheetOpen(false); setEditingContact(null); }}
      />
    </div>
  );
};

export default NetworkView;
