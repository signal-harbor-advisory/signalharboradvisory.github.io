/**
 * form.spec.ts
 * Tests for the inquiry form state machine: idle → submitting → success/failure.
 */

import { test, expect } from '@playwright/test';

const FORM_URL = '/contact';
const FORM_URL_FAILURE = '/contact?preview=failure';

async function fillRequiredFields(page: import('@playwright/test').Page) {
  await page.fill('#field-name', 'Test User');
  await page.fill('#field-organization', 'Test Organization');
  await page.fill('#field-role', 'Chief Technology Officer');
  await page.fill('#field-email', 'test@example.com');
  await page.selectOption('#field-inquiry', 'Technology strategy or transformation');
  await page.fill('#field-description', 'A brief description of the inquiry for testing purposes.');
  await page.check('#field-confidentiality');
}

test.describe('Inquiry form — success flow', () => {
  test('form idle state renders all required fields', async ({ page }) => {
    await page.goto(FORM_URL);
    await expect(page.locator('#form-idle')).toBeVisible();
    await expect(page.locator('#field-name')).toBeVisible();
    await expect(page.locator('#field-email')).toBeVisible();
    await expect(page.locator('#field-inquiry')).toBeVisible();
    await expect(page.locator('#field-description')).toBeVisible();
    await expect(page.locator('#field-confidentiality')).toBeVisible();
  });

  test('valid form submission reaches success state', async ({ page }) => {
    await page.goto(FORM_URL);
    await fillRequiredFields(page);
    await page.click('#form-submit');

    // submitting state briefly shows spinner
    await expect(page.locator('#form-submitting')).toBeVisible();

    // success state appears after simulated delay
    await expect(page.locator('#form-success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#form-idle')).toBeHidden();
  });

  test('success state contains return link', async ({ page }) => {
    await page.goto(FORM_URL);
    await fillRequiredFields(page);
    await page.click('#form-submit');
    await expect(page.locator('#form-success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#form-success a[href="/"]')).toBeVisible();
  });
});

test.describe('Inquiry form — failure flow', () => {
  test('?preview=failure shows failure state after submission', async ({ page }) => {
    await page.goto(FORM_URL_FAILURE);
    await fillRequiredFields(page);
    await page.click('#form-submit');
    await expect(page.locator('#form-failure')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#form-success')).toBeHidden();
  });

  test('retry button returns to idle state', async ({ page }) => {
    await page.goto(FORM_URL_FAILURE);
    await fillRequiredFields(page);
    await page.click('#form-submit');
    await expect(page.locator('#form-failure')).toBeVisible({ timeout: 5000 });
    await page.click('#form-retry');
    await expect(page.locator('#form-idle')).toBeVisible();
  });
});

test.describe('Inquiry form — validation', () => {
  test('empty submission shows errors without advancing state', async ({ page }) => {
    await page.goto(FORM_URL);
    await page.click('#form-submit');
    // Should remain on idle state
    await expect(page.locator('#form-idle')).toBeVisible();
    await expect(page.locator('#form-submitting')).toBeHidden();
  });

  test('invalid email shows field error', async ({ page }) => {
    await page.goto(FORM_URL);
    await page.fill('#field-name', 'Test User');
    await page.fill('#field-organization', 'Org');
    await page.fill('#field-role', 'CTO');
    await page.fill('#field-email', 'not-an-email');
    await page.selectOption('#field-inquiry', 'Technology strategy or transformation');
    await page.fill('#field-description', 'Description.');
    await page.check('#field-confidentiality');
    await page.click('#form-submit');

    // Should remain idle — email validation prevents advance
    await expect(page.locator('#form-idle')).toBeVisible();
  });
});
