import { useState } from 'react';
import { NetworkCanvas } from '@/components/NetworkCanvas';
import { CreateContactSheet } from '@/components/CreateContactSheet';

const NetworkView = () => {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="h-full w-full relative">
      <NetworkCanvas onCreateContact={() => setSheetOpen(true)} />
      <CreateContactSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
};

export default NetworkView;
