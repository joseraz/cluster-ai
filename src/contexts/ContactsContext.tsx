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
  addContact:    (contact: Omit<Contact, 'id' | 'createdAt'>) => Promise<Contact>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  /** Dev-only: bulk-insert the 23 sample contacts */
  loadSeedData:  () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ContactsContext = createContext<ContactsContextValue>({
  contacts:     [],
  isLoading:    false,
  error:        null,
  addContact:    async () => ({} as Contact),
  updateContact: async () => ({} as Contact),
  deleteContact: async () => {},
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
    onSuccess:  (created) => {
      queryClient.setQueryData<Contact[]>(['contacts'], (current = []) => [
        ...current,
        created,
      ]);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Contact> }) =>
      apiUpdateContact(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<Contact[]>(['contacts'], (current = []) =>
        current.map(contact => contact.id === updated.id ? updated : contact)
      );
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteContact(id),
    onSuccess:  (_result, deletedId) => {
      queryClient.setQueryData<Contact[]>(['contacts'], (current = []) =>
        current.filter(contact => contact.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  // ── Stable action callbacks ────────────────────────────────────────────────
  const addContact = (data: Omit<Contact, 'id' | 'createdAt'>) =>
    addMutation.mutateAsync(data);

  const updateContact = (id: string, updates: Partial<Contact>) =>
    updateMutation.mutateAsync({ id, updates });

  const deleteContact = (id: string) =>
    deleteMutation.mutateAsync(id);

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
