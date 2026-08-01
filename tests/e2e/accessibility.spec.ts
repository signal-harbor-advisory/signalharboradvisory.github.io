/**
 * accessibility.spec.ts
 * axe-core accessibility scan on every public route.
 * Target: zero WCAG 2.2 AA violations on every page.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  { path: '/',           name: 'Home' },
  { path: '/advisory',   name: 'Advisory' },
  { path: '/experience', name: 'Experience' },
  { path: '/about',      name: 'About' },
  { path: '/insights',   name: 'Insights index' },
  { path: '/contact',    name: 'Contact' },
  { path: '/privacy',    name: 'Privacy' },
  { path: '/terms',      name: 'Terms' },
  {
    path: '/insights/modernizing-critical-platforms',
    name: 'Article: Modernizing Critical Platforms',
  },
  {
    path: '/insights/enterprise-ai-operating-model',
    name: 'Article: Enterprise AI Operating Model',
  },
  {
    path: '/insights/engineering-transformation-decision-rights',
    name: 'Article: Engineering Transformation Decision Rights',
  },
];

for (const route of routes) {
  test(`${route.name} — zero axe violations`, async ({ page }) => {
    await page.goto(route.path);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
