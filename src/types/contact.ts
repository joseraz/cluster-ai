/**
 * Shared domain types for contacts, clusters, and the contact-creation form.
 *
 * These shapes are used across the api layer (src/api/*), contexts, lib
 * utilities, and components — they live here so no module has to import
 * domain types from a provider or a component.
 */

export type ConnectionType =
  | 'colleague' | 'friend' | 'mentor' | 'client'
  | 'partner' | 'family' | 'investor' | 'acquaintance';

export interface Contact {
  id: string;
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
  relationshipStories?: RelationshipStory[];
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

export interface RelationshipStory {
  id: string;
  body: string;
  summary?: string;
  summaryStatus?: string;
  occurredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipStoryFormData {
  id?: string;
  body: string;
  summary?: string;
  summaryStatus?: string;
  occurredAt?: string;
}

export interface Cluster {
  id: string;
  name: string;
  contactIds: string[];
  createdAt: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  livesIn?: string;
  connectionType?: ConnectionType;
  connectionStrength: number;
  howWeMet?: string;
  relationshipStories: RelationshipStoryFormData[];
}
