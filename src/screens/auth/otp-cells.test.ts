import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const registerSource = fs.readFileSync(path.join(__dirname, 'RegisterScreen', 'index.tsx'), 'utf8');
const registerElements = fs.readFileSync(path.join(__dirname, 'RegisterScreen', 'elements.tsx'), 'utf8');

describe('registration OTP cells', () => {
  it('renders six coordinated verification inputs with mobile OTP semantics', () => {
    expect(registerSource).toContain('REGISTRATION_OTP_LENGTH');
    expect(registerSource).toContain('<OtpCells');
    expect(registerSource).toContain('one-time-code');
    expect(registerSource).toContain('handleOtpPaste');
    expect(registerSource).toContain("event.key === 'Backspace'");
    expect(registerSource).toContain("event.key === 'ArrowLeft'");
    expect(registerSource).toContain("event.key === 'ArrowRight'");
  });

  it('keeps the cells responsive and theme-driven', () => {
    expect(registerElements).toContain("gridTemplateColumns: 'repeat(6, minmax(0, 1fr))'");
    expect(registerElements).toContain('theme.vars.palette.water.main');
    expect(registerElements).toContain("[theme.breakpoints.down('sm')]");
    expect(registerElements).not.toContain('sx=');
  });
});
