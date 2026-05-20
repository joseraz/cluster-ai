import { useState } from 'react';
import { OrbitalCanvas } from '@/components/network/OrbitalCanvas';
import { CreateContactSheet } from '@/components/contacts/CreateContactSheet';

const NetworkView = () => {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="h-full w-full relative">
      <OrbitalCanvas onCreateContact={() => setSheetOpen(true)} />
      <CreateContactSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
};

export default NetworkView;
