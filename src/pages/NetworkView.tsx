import { useState } from 'react';
import { OrbitalCanvas } from '@/components/network/OrbitalCanvas';
import { CreateContactSheet } from '@/components/contacts/CreateContactSheet';
import { useSearch } from '@/contexts/SearchContext';

const NetworkView = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { searchResults, queryTokens } = useSearch();

  return (
    <div className="h-full w-full relative">
      <OrbitalCanvas
        onCreateContact={() => setSheetOpen(true)}
        searchResults={searchResults}
        queryTokens={queryTokens}
      />
      <CreateContactSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
};

export default NetworkView;
