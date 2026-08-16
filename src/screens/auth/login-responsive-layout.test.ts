import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const scaffoldElements = fs.readFileSync(
  path.join(__dirname, 'AuthScaffold', 'elements.tsx'),
  'utf8',
);
const scaffoldSource = fs.readFileSync(
  path.join(__dirname, 'AuthScaffold', 'index.tsx'),
  'utf8',
);
const loginElements = fs.readFileSync(
  path.join(__dirname, 'LoginScreen', 'elements.tsx'),
  'utf8',
);

describe('responsive authentication layout contract', () => {
  it('keeps the viewport shell full width while capping each desktop content rail to half of the shared 1440px system', () => {
    expect(scaffoldElements).toContain("width: '100%'");
    expect(scaffoldElements).toContain('maxWidth: theme.layout.maxContentWidth / 2');
    expect(scaffoldElements).not.toContain('maxWidth: 1440');
  });

  it('provides a deliberate mobile order with brand header, media strip, and form content', () => {
    expect(scaffoldSource).toContain('<MobileHeader>');
    expect(scaffoldSource).toContain('<MediaPane aria-hidden="true">');
    expect(scaffoldSource).toContain('<FormPane id="main-content"');
    expect(scaffoldElements).toContain("[theme.breakpoints.down('md')]");
    expect(scaffoldElements).toContain("display: 'none'");
  });

  it('keeps small-screen workspace controls compact without sacrificing the existing touch target', () => {
    expect(loginElements).toContain("minHeight: theme.spacing(5.5)");
    expect(loginElements).toContain("[theme.breakpoints.down('sm')]");
    expect(loginElements).toContain("paddingInline: theme.spacing(1.5)");
  });
});
