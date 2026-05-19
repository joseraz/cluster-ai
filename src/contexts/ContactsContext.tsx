import { createContext, useContext, useEffect, useState } from 'react';

export type ConnectionType =
  | 'colleague' | 'friend' | 'mentor' | 'client'
  | 'collaborator' | 'family' | 'investor' | 'acquaintance';

export interface Contact {
  id: string;
  profileImage?: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  livesIn?: string;
  socialLinks?: string[];
  connectionType?: ConnectionType;
  connectionStrength?: number;
  howWeMet?: string;
  interests?: {
    about?: string;
    hobbies?: string;
    favouriteFood?: string;
  };
  careerAndWork?: {
    role?: string;
    company?: string;
    notes?: string;
  };
  education?: {
    institution?: string;
    degree?: string;
  };
  createdAt: string;
}

export interface Cluster {
  id: string;
  name: string;
  contactIds: string[];
  createdAt: string;
}

const SEED_CONTACTS: Contact[] = [
  { id: '2', firstName: 'Sarah', lastName: 'Chen', company: 'TechCorp', livesIn: 'San Francisco, CA', connectionType: 'colleague', connectionStrength: 8, createdAt: '2024-01-01' },
  { id: '3', firstName: 'Michael', lastName: 'Rodriguez', company: 'StartupXYZ', livesIn: 'New York, NY', connectionType: 'friend', connectionStrength: 7, createdAt: '2024-01-01' },
  { id: '4', firstName: 'Jennifer', lastName: 'Kim', company: 'Enterprise Inc', livesIn: 'Seattle, WA', connectionType: 'client', connectionStrength: 6, createdAt: '2024-01-01' },
  { id: '5', firstName: 'David', lastName: 'Thompson', company: 'Consulting Co', livesIn: 'Chicago, IL', connectionType: 'colleague', connectionStrength: 5, createdAt: '2024-01-01' },
  { id: '6', firstName: 'Lisa', lastName: 'Wang', company: 'Innovation Labs', livesIn: 'Austin, TX', connectionType: 'mentor', connectionStrength: 9, createdAt: '2024-01-01' },
  { id: '7', firstName: 'Robert', lastName: 'Chen', company: 'Data Systems', livesIn: 'Boston, MA', connectionType: 'collaborator', connectionStrength: 7, createdAt: '2024-01-01' },
  { id: '8', firstName: 'Emma', lastName: 'Davis', company: 'Design Studio', livesIn: 'Los Angeles, CA', connectionType: 'friend', connectionStrength: 8, createdAt: '2024-01-01' },
  { id: '9', firstName: 'James', lastName: 'Wilson', company: 'Marketing Plus', livesIn: 'Miami, FL', connectionType: 'acquaintance', connectionStrength: 3, createdAt: '2024-01-01' },
  { id: '10', firstName: 'Sophie', lastName: 'Martinez', company: 'Finance Corp', livesIn: 'Denver, CO', connectionType: 'colleague', connectionStrength: 6, createdAt: '2024-01-01' },
  { id: '11', firstName: 'Kevin', lastName: 'Brown', company: 'Sales Force', livesIn: 'Atlanta, GA', connectionType: 'client', connectionStrength: 5, createdAt: '2024-01-01' },
  { id: '12', firstName: 'Anna', lastName: 'Lee', company: 'HR Solutions', livesIn: 'Portland, OR', connectionType: 'colleague', connectionStrength: 7, createdAt: '2024-01-01' },
  { id: '13', firstName: 'Tom', lastName: 'Garcia', company: 'Operations Inc', livesIn: 'Phoenix, AZ', connectionType: 'acquaintance', connectionStrength: 4, createdAt: '2024-01-01' },
  { id: '14', firstName: 'Rachel', lastName: 'Green', company: 'Media Group', livesIn: 'Nashville, TN', connectionType: 'friend', connectionStrength: 6, createdAt: '2024-01-01' },
  { id: '15', firstName: 'Daniel', lastName: 'White', company: 'Tech Innovations', livesIn: 'San Diego, CA', connectionType: 'collaborator', connectionStrength: 8, createdAt: '2024-01-01' },
  { id: '16', firstName: 'Mark', lastName: 'Johnson', company: 'Consulting Pro', livesIn: 'Dallas, TX', connectionType: 'mentor', connectionStrength: 9, createdAt: '2024-01-01' },
  { id: '17', firstName: 'Maria', lastName: 'Lopez', company: 'Strategy Group', livesIn: 'Houston, TX', connectionType: 'colleague', connectionStrength: 6, createdAt: '2024-01-01' },
  { id: '18', firstName: 'Chris', lastName: 'Taylor', company: 'Tech Advisors', livesIn: 'Minneapolis, MN', connectionType: 'mentor', connectionStrength: 8, createdAt: '2024-01-01' },
  { id: '19', firstName: 'Laura', lastName: 'Miller', company: 'Industry Leaders', livesIn: 'Detroit, MI', connectionType: 'investor', connectionStrength: 7, createdAt: '2024-01-01' },
  { id: '20', firstName: 'Steve', lastName: 'Anderson', company: 'Business Dev', livesIn: 'Philadelphia, PA', connectionType: 'collaborator', connectionStrength: 5, createdAt: '2024-01-01' },
  { id: '21', firstName: 'Nicole', lastName: 'Davis', company: 'Growth Partners', livesIn: 'San Jose, CA', connectionType: 'investor', connectionStrength: 6, createdAt: '2024-01-01' },
  { id: '22', firstName: 'Paul', lastName: 'Wilson', company: 'StartupHub', livesIn: 'London, UK', connectionType: 'investor', connectionStrength: 7, createdAt: '2024-01-01' },
  { id: '23', firstName: 'Helen', lastName: 'Zhang', company: 'AI Ventures', livesIn: 'Singapore', connectionType: 'investor', connectionStrength: 8, createdAt: '2024-01-01' },
  { id: '24', firstName: 'Alex', lastName: 'Turner', company: 'Digital Agency', livesIn: 'Berlin, Germany', connectionType: 'collaborator', connectionStrength: 7, createdAt: '2024-01-01' },
];

interface ContactsContextValue {
  contacts: Contact[];
  clusters: Cluster[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
}

const ContactsContext = createContext<ContactsContextValue>({
  contacts: [],
  clusters: [],
  addContact: () => {},
  updateContact: () => {},
  deleteContact: () => {},
});

const STORAGE_KEY = 'cluster-contacts';

function loadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_e) { /* ignore corrupt storage */ }
  return SEED_CONTACTS;
}

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(loadContacts);
  const [clusters] = useState<Cluster[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const addContact = (data: Omit<Contact, 'id' | 'createdAt'>) => {
    const contact: Contact = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setContacts(prev => [...prev, contact]);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <ContactsContext.Provider value={{ contacts, clusters, addContact, updateContact, deleteContact }}>
      {children}
    </ContactsContext.Provider>
  );
}

export const useContacts = () => useContext(ContactsContext);
