/**
 * navigation.spec.ts
 * Tests for navigation landmarks, skip link, and mobile menu.
 */

import { test, expect } from '@playwright/test';

const routes = ['/', '/advisory', '/experience', '/about', '/insights', '/contact'];

test.describe('Skip link', () => {
  for (const route of routes) {
    test(`skip link present on ${route}`, async ({ page }) => {
      await page.goto(route);
      const skipLink = page.locator('a.skip-link');
      await expect(skipLink).toHaveCount(1);
    });
  }
});

test.describe('Navigation landmarks', () => {
  for (const route of routes) {
    test(`main landmark present on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('main#main-content')).toBeVisible();
    });

    test(`nav landmark present on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('nav')).toHaveCount(1);
    });

    test(`footer landmark present on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('footer')).toBeVisible();
    });
  }
});

test.describe('Mobile menu', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hamburger button is present and labeled', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('#nav-toggle');
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('menu opens when hamburger clicked', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('#nav-toggle');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#nav-drawer')).toBeVisible();
  });

  test('menu closes on Escape', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-toggle').click();
    await expect(page.locator('#nav-drawer')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#nav-toggle')).toHaveAttribute('aria-expanded', 'false');
  });

  test('menu closes when close button clicked', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-toggle').click();
    await page.locator('#nav-close').click();
    await expect(page.locator('#nav-toggle')).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('Internal links return 200', () => {
  test('Home page renders', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('Advisory page renders', async ({ page }) => {
    const response = await page.goto('/advisory');
    expect(response?.status()).toBe(200);
  });

  test('Experience page renders', async ({ page }) => {
    const response = await page.goto('/experience');
    expect(response?.status()).toBe(200);
  });

  test('About page renders', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);
  });

  test('Insights index renders', async ({ page }) => {
    const response = await page.goto('/insights');
    expect(response?.status()).toBe(200);
  });

  test('Contact page renders', async ({ page }) => {
    const response = await page.goto('/contact');
    expect(response?.status()).toBe(200);
  });

  test('First article renders', async ({ page }) => {
    const response = await page.goto('/insights/modernizing-critical-platforms');
    expect(response?.status()).toBe(200);
  });
});
