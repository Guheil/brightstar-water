import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const overviewSource = fs.readFileSync(path.join(__dirname, 'OverviewScreen', 'index.tsx'), 'utf8');
const overviewElements = fs.readFileSync(path.join(__dirname, 'OverviewScreen', 'elements.tsx'), 'utf8');

describe('operations overview hierarchy', () => {
  it('preserves the existing operational actions and asymmetric work queues', () => {
    expect(overviewSource).toContain('href="/admin/products/new"');
    expect(overviewSource).toContain('href="/admin/inventory"');
    expect(overviewSource).toContain('href="/admin/orders"');
    expect(overviewSource).toContain('href="/admin/deliveries"');
    expect(overviewSource).toContain('<PrimarySection');
    expect(overviewSource).toContain('<SideStack>');
  });

  it('keeps motion limited to orientation instead of animating every metric and queue item', () => {
    expect(overviewSource).toContain('useGSAP');
    expect(overviewSource).toContain('(prefers-reduced-motion: no-preference)');
    expect(overviewSource).toContain('data-overview-stage');
    expect(overviewSource).not.toContain(".from('[data-overview-metric]'");
    expect(overviewSource).not.toContain(".from('[data-overview-work]'");
  });

  it('removes decorative double-line and card-soup treatments', () => {
    expect(overviewSource).not.toContain('StageAccent');
    expect(overviewElements).not.toContain('&::before');
    expect(overviewElements).not.toContain('&::after');
    expect(overviewElements).not.toContain('boxShadow');
    expect(overviewElements).not.toContain('linear-gradient');
  });
});
