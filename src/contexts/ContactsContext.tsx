import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getContacts,
  createContact,
  updateContact as apiUpdateContact,
  deleteContact as apiDeleteContact,
} from '@/api/contacts';
import { SEED_CONTACTS } from '@/lib/seedData';
import type { Contact } from '@/types/contact';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ContactsContextValue {
  contacts: Contact[];
  isLoading: boolean;
  error: Error | null;
  addContact:    (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  /** Dev-only: bulk-insert the 23 sample contacts */
  loadSeedData:  () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ContactsContext = createContext<ContactsContextValue>({
  contacts:     [],
  isLoading:    false,
  error:        null,
  addContact:    () => {},
  updateContact: () => {},
  deleteContact: () => {},
  loadSeedData:  async () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const {
    data: contacts = [],
    isLoading,
    error,
  } = useQuery<Contact[], Error>({
    queryKey: ['contacts'],
    queryFn:  getContacts,
    staleTime: 30_000, // consider fresh for 30 s
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (data: Omit<Contact, 'id' | 'createdAt'>) => createContact(data),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Contact> }) =>
      apiUpdateContact(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteContact(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  // ── Stable action callbacks ────────────────────────────────────────────────
  const addContact = (data: Omit<Contact, 'id' | 'createdAt'>) =>
    addMutation.mutate(data);

  const updateContact = (id: string, updates: Partial<Contact>) =>
    updateMutation.mutate({ id, updates });

  const deleteContact = (id: string) =>
    deleteMutation.mutate(id);

  /** Inserts all seed contacts — dev mode only */
  const loadSeedData = async () => {
    await Promise.all(SEED_CONTACTS.map(c => createContact(c)));
    await queryClient.invalidateQueries({ queryKey: ['contacts'] });
  };

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        isLoading,
        error,
        addContact,
        updateContact,
        deleteContact,
        loadSeedData,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export const useContacts = () => useContext(ContactsContext);
