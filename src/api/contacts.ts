import type { Contact } from '@/types/contact';
import { apiFetch } from './client';

const BASE = '/api/contacts';

export async function getContacts(): Promise<Contact[]> {
  const res = await apiFetch(BASE);
  if (!res.ok) throw new Error(`Failed to fetch contacts: ${res.statusText}`);
  return res.json();
}

export async function createContact(
  data: Omit<Contact, 'id' | 'createdAt'>
): Promise<Contact> {
  const res = await apiFetch(BASE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create contact: ${res.statusText}`);
  return res.json();
}

export async function updateContact(
  id: string,
  updates: Partial<Contact>
): Promise<Contact> {
  const res = await apiFetch(`${BASE}/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update contact: ${res.statusText}`);
  return res.json();
}

export async function deleteContact(id: string): Promise<void> {
  const res = await apiFetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete contact: ${res.statusText}`);
}
