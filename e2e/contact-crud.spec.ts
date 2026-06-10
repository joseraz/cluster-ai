/**
 * CRUD regression suite — orbital canvas UI.
 *
 * Drives the real app (Vite + Hono on dedicated ports, isolated e2e.db) through
 * the four core flows: create via the contact sheet, read via node + hover card,
 * update via the hover-card pencil → edit sheet, delete via the destructive
 * confirmation. This is the bread and butter of the platform — it must pass
 * before any feature is considered complete.
 */
import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:3201';

async function seedContact(request: APIRequestContext, overrides: Record<string, unknown> = {}) {
  const res = await request.post(`${API_BASE}/api/contacts`, {
    data: {
      firstName: 'Edith',
      lastName: 'Seeded',
      livesIn: 'Marylebone, London',
      connectionType: 'client',
      connectionStrength: 3,
      howWeMet: 'Seeded by the E2E suite',
      ...overrides,
    },
  });
  expect(res.status()).toBe(201);
  return res.json();
}

/** Freeze the orbital spin so node hovers are deterministic. */
async function pauseSpin(page: Page) {
  await page.getByTestId('spin-level-0').click();
}

async function hoverNode(page: Page, contactId: string) {
  const node = page.locator(`[data-contact-id="${contactId}"]`);
  await expect(node).toBeVisible();
  await node.hover();
  await expect(page.getByTestId('node-hover-card')).toBeVisible();
}

test('create: a contact added via the sheet appears on the canvas', async ({ page }) => {
  await page.goto('/app/network');
  await page.getByRole('button', { name: 'Create contact' }).click();

  await page.locator('#firstName').fill('Frida');
  await page.locator('#lastName').fill('Painter');
  await page.getByRole('button', { name: 'Friend', exact: true }).click();
  await page.locator('#howWeMet').fill('Vernissage at the gallery');

  await page.getByRole('button', { name: 'Create Contact', exact: true }).click();

  await expect(page.getByTestId('orbital-node')).toHaveCount(1);

  // Read: hover shows the contact's details
  await pauseSpin(page);
  const node = page.getByTestId('orbital-node');
  await node.hover();
  await expect(page.getByTestId('node-hover-card')).toContainText('Frida Painter');
});

test('update: editing via the hover-card pencil persists and re-renders', async ({ page, request }) => {
  const contact = await seedContact(request, { firstName: 'Umberto', lastName: 'Original' });

  await page.goto('/app/network');
  await pauseSpin(page);
  await hoverNode(page, contact.id);
  await page.getByTestId('edit-contact-button').click();

  // Sheet opens in edit mode, prefilled
  await expect(page.getByRole('heading', { name: 'Update Contact' })).toBeVisible();
  await expect(page.locator('#firstName')).toHaveValue('Umberto');

  await page.locator('#lastName').fill('Updated');
  await page.getByTestId('contact-sheet-save').click();

  // Canvas reflects the change without a reload
  await hoverNode(page, contact.id);
  await expect(page.getByTestId('node-hover-card')).toContainText('Umberto Updated');

  // And it persisted server-side
  const res = await request.get(`${API_BASE}/api/contacts/${contact.id}`);
  expect((await res.json()).lastName).toBe('Updated');
});

test('delete: confirming the destructive modal removes the contact everywhere', async ({ page, request }) => {
  const contact = await seedContact(request, { firstName: 'Dora', lastName: 'Doomed' });

  await page.goto('/app/network');
  await pauseSpin(page);
  await hoverNode(page, contact.id);
  await page.getByTestId('edit-contact-button').click();

  await page.getByTestId('contact-sheet-delete').click();
  await expect(page.getByText(`Delete ${contact.firstName} ${contact.lastName}?`)).toBeVisible();
  await page.getByTestId('confirm-delete-button').click();

  // Node gone from the canvas
  await expect(page.locator(`[data-contact-id="${contact.id}"]`)).toHaveCount(0);

  // Gone from the API too
  const res = await request.get(`${API_BASE}/api/contacts/${contact.id}`);
  expect(res.status()).toBe(404);
});
