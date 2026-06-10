/**
 * Sample contacts for development / demo purposes.
 * These can be loaded via the "Load sample data" button in dev mode.
 * IDs are omitted — the server assigns real UUIDs on insert.
 */
import type { Contact } from '@/types/contact';

export const SEED_CONTACTS: Omit<Contact, 'id' | 'createdAt'>[] = [
  { firstName: 'Sarah',    lastName: 'Chen',       company: 'TechCorp',           livesIn: 'San Francisco, CA',  connectionType: 'colleague',    connectionStrength: 8 },
  { firstName: 'Michael',  lastName: 'Rodriguez',  company: 'StartupXYZ',         livesIn: 'New York, NY',       connectionType: 'friend',       connectionStrength: 7 },
  { firstName: 'Jennifer', lastName: 'Kim',        company: 'Enterprise Inc',     livesIn: 'Seattle, WA',        connectionType: 'client',       connectionStrength: 6 },
  { firstName: 'David',    lastName: 'Thompson',   company: 'Consulting Co',      livesIn: 'Chicago, IL',        connectionType: 'colleague',    connectionStrength: 5 },
  { firstName: 'Lisa',     lastName: 'Wang',       company: 'Innovation Labs',    livesIn: 'Austin, TX',         connectionType: 'mentor',       connectionStrength: 9 },
  { firstName: 'Robert',   lastName: 'Chen',       company: 'Data Systems',       livesIn: 'Boston, MA',         connectionType: 'partner',      connectionStrength: 7 },
  { firstName: 'Emma',     lastName: 'Davis',      company: 'Design Studio',      livesIn: 'Los Angeles, CA',    connectionType: 'friend',       connectionStrength: 8 },
  { firstName: 'James',    lastName: 'Wilson',     company: 'Marketing Plus',     livesIn: 'Miami, FL',          connectionType: 'acquaintance', connectionStrength: 3 },
  { firstName: 'Sophie',   lastName: 'Martinez',   company: 'Finance Corp',       livesIn: 'Denver, CO',         connectionType: 'colleague',    connectionStrength: 6 },
  { firstName: 'Kevin',    lastName: 'Brown',      company: 'Sales Force',        livesIn: 'Atlanta, GA',        connectionType: 'client',       connectionStrength: 5 },
  { firstName: 'Anna',     lastName: 'Lee',        company: 'HR Solutions',       livesIn: 'Portland, OR',       connectionType: 'colleague',    connectionStrength: 7 },
  { firstName: 'Tom',      lastName: 'Garcia',     company: 'Operations Inc',     livesIn: 'Phoenix, AZ',        connectionType: 'acquaintance', connectionStrength: 4 },
  { firstName: 'Rachel',   lastName: 'Green',      company: 'Media Group',        livesIn: 'Nashville, TN',      connectionType: 'friend',       connectionStrength: 6 },
  { firstName: 'Daniel',   lastName: 'White',      company: 'Tech Innovations',   livesIn: 'San Diego, CA',      connectionType: 'partner',      connectionStrength: 8 },
  { firstName: 'Mark',     lastName: 'Johnson',    company: 'Consulting Pro',     livesIn: 'Dallas, TX',         connectionType: 'mentor',       connectionStrength: 9 },
  { firstName: 'Maria',    lastName: 'Lopez',      company: 'Strategy Group',     livesIn: 'Houston, TX',        connectionType: 'colleague',    connectionStrength: 6 },
  { firstName: 'Chris',    lastName: 'Taylor',     company: 'Tech Advisors',      livesIn: 'Minneapolis, MN',    connectionType: 'mentor',       connectionStrength: 8 },
  { firstName: 'Laura',    lastName: 'Miller',     company: 'Industry Leaders',   livesIn: 'Detroit, MI',        connectionType: 'investor',     connectionStrength: 7 },
  { firstName: 'Steve',    lastName: 'Anderson',   company: 'Business Dev',       livesIn: 'Philadelphia, PA',   connectionType: 'partner',      connectionStrength: 5 },
  { firstName: 'Nicole',   lastName: 'Davis',      company: 'Growth Partners',    livesIn: 'San Jose, CA',       connectionType: 'investor',     connectionStrength: 6 },
  { firstName: 'Paul',     lastName: 'Wilson',     company: 'StartupHub',         livesIn: 'London, UK',         connectionType: 'investor',     connectionStrength: 7 },
  { firstName: 'Helen',    lastName: 'Zhang',      company: 'AI Ventures',        livesIn: 'Singapore',          connectionType: 'investor',     connectionStrength: 8 },
  { firstName: 'Alex',     lastName: 'Turner',     company: 'Digital Agency',     livesIn: 'Berlin, Germany',    connectionType: 'partner',      connectionStrength: 7 },
];
