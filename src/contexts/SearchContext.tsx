/**
 * SearchContext
 *
 * Shared search state for the whole app.
 * Consumed by NetworkView (canvas animation) and ContactsView (list filter).
 * Must be rendered inside <ContactsProvider> since it calls useContacts().
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { useContacts } from '@/contexts/ContactsContext';
import { searchContacts, tokenize } from '@/lib/contactSearch';
import type { SearchResult } from '@/lib/contactSearch';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SearchContextValue {
  searchQuery:   string | null;
  searchResults: SearchResult[] | null;
  queryTokens:   string[];
  submitSearch:  (query: string) => void;
  clearSearch:   () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const SearchContext = createContext<SearchContextValue>({
  searchQuery:   null,
  searchResults: null,
  queryTokens:   [],
  submitSearch:  () => {},
  clearSearch:   () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { contacts } = useContacts();

  const [searchQuery,   setSearchQuery]   = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);

  const submitSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    setSearchResults(searchContacts(trimmed, contacts));
  }, [contacts]);

  const clearSearch = useCallback(() => {
    setSearchQuery(null);
    setSearchResults(null);
  }, []);

  const queryTokens = searchQuery ? tokenize(searchQuery) : [];

  return (
    <SearchContext.Provider
      value={{ searchQuery, searchResults, queryTokens, submitSearch, clearSearch }}
    >
      {children}
    </SearchContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useSearch = () => useContext(SearchContext);
