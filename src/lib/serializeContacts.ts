import type { Contact } from '@/types/contact';

/**
 * Converts the contacts array into a structured plaintext block suitable
 * for injection into the ElevenLabs agent via sendContextualUpdate().
 *
 * NOTE(privacy): This serialises the FULL contact list and transmits it to
 * ElevenLabs servers on every session start. This is intentional for the MVP
 * demo. The fast-follow is to migrate to client tools so only query results
 * (never the full dataset) leave the browser.
 */
export function serializeContacts(contacts: Contact[]): string {
  if (contacts.length === 0) {
    return 'The user currently has no contacts in their network.';
  }

  const lines: string[] = [
    `The user has ${contacts.length} contact${contacts.length === 1 ? '' : 's'} in their network:\n`,
  ];

  contacts.forEach((c, i) => {
    lines.push(`${i + 1}. ${c.firstName} ${c.lastName}`);

    if (c.livesIn) lines.push(`   Location: ${c.livesIn}`);

    const company = c.careerAndWork?.company ?? c.company;
    const role    = c.careerAndWork?.role;
    if (role && company) lines.push(`   Role: ${role} at ${company}`);
    else if (company)    lines.push(`   Company: ${company}`);
    else if (role)       lines.push(`   Role: ${role}`);

    if (c.careerAndWork?.notes) lines.push(`   Work notes: ${c.careerAndWork.notes}`);

    if (c.connectionType) {
      const strength = c.connectionStrength != null ? ` | Strength: ${c.connectionStrength}/10` : '';
      lines.push(`   Connection: ${c.connectionType}${strength}`);
    }
    if (c.howWeMet) lines.push(`   How we met: ${c.howWeMet}`);
    if (c.email)   lines.push(`   Email: ${c.email}`);
    if (c.phone)   lines.push(`   Phone: ${c.phone}`);

    if (c.interests?.about)        lines.push(`   About: ${c.interests.about}`);
    if (c.interests?.hobbies)      lines.push(`   Hobbies: ${c.interests.hobbies}`);
    if (c.interests?.favouriteFood) lines.push(`   Favourite food: ${c.interests.favouriteFood}`);

    if (c.education?.institution) {
      const degree = c.education.degree ? `, ${c.education.degree}` : '';
      lines.push(`   Education: ${c.education.institution}${degree}`);
    }

    if (c.socialLinks && c.socialLinks.length > 0) {
      lines.push(`   Social links: ${c.socialLinks.join(', ')}`);
    }

    lines.push(''); // blank line between contacts
  });

  return lines.join('\n');
}
