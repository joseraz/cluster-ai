import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ContactsPanelContextValue {
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

const ContactsPanelContext = createContext<ContactsPanelContextValue | null>(null);

export function ContactsPanelProvider({ children }: { children: ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false);
  return (
    <ContactsPanelContext.Provider value={{
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
      togglePanel: () => setPanelOpen(prev => !prev),
    }}>
      {children}
    </ContactsPanelContext.Provider>
  );
}

export function useContactsPanel() {
  const ctx = useContext(ContactsPanelContext);
  if (!ctx) throw new Error('useContactsPanel must be used within ContactsPanelProvider');
  return ctx;
}
