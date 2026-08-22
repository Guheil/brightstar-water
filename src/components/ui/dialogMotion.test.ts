import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const transitionSource = read('src/components/ui/DialogMotionTransition/index.tsx');
const cartDialogSource = read('src/components/ui/AddToCartConfirmDialog/index.tsx');
const cartElementsSource = read('src/components/ui/AddToCartConfirmDialog/elements.tsx');
const logoutDialogSource = read('src/components/ui/LogoutConfirmDialog/index.tsx');
const logoutElementsSource = read('src/components/ui/LogoutConfirmDialog/elements.tsx');

 describe('shared modal motion contract', () => {
  it('uses MUI transition lifecycle callbacks so exit completes before the modal unmounts', () => {
    expect(transitionSource).toContain("import Fade from '@mui/material/Fade'");
    expect(transitionSource).toContain("import gsap from 'gsap'");
    expect(transitionSource).toContain("'(prefers-reduced-motion: reduce)'");
    expect(transitionSource).toContain('onEnter={handleEnter}');
    expect(transitionSource).toContain('onExited={handleExited}');
    expect(transitionSource).toContain('exit: dialogMotion.exitDuration');
    expect(cartDialogSource).toContain('slots={{ transition: DialogMotionTransition }}');
    expect(logoutDialogSource).toContain('slots={{ transition: DialogMotionTransition }}');
    expect(cartDialogSource).not.toContain('transitionDuration={0}');
    expect(logoutDialogSource).not.toContain('transitionDuration={0}');
    expect(cartDialogSource).not.toContain('useDialogMotion');
    expect(logoutDialogSource).not.toContain('useDialogMotion');
  });

  it('uses light icon glyphs on semantic brand surfaces', () => {
    expect(cartElementsSource).toContain('backgroundColor: theme.vars.palette.water.main');
    expect(cartElementsSource).toContain('color: theme.vars.palette.water.contrastText');
    expect(logoutElementsSource).toContain('backgroundColor: theme.vars.palette.warning.main');
    expect(logoutElementsSource).toContain('color: theme.vars.palette.warning.contrastText');
    expect(cartElementsSource).not.toContain('color: theme.vars.palette.primary.dark');
    expect(logoutElementsSource).not.toContain('color: theme.vars.palette.warning.dark');
  });

  it('marks modal sections for sequenced entrance and exit motion', () => {
    expect(cartDialogSource).toContain('data-modal-icon');
    expect(cartDialogSource).toContain('data-modal-body');
    expect(cartDialogSource).toContain('data-modal-actions');
    expect(logoutDialogSource).toContain('data-modal-icon');
    expect(logoutDialogSource).toContain('data-modal-body');
    expect(logoutDialogSource).toContain('data-modal-actions');
  });
});
