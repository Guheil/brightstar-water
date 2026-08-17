import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MUIStyleProvider from '@/theme/MUIStyleProvider';
import RegistrationAgreementDialog from './index';

const markViewportAtEnd = (element: HTMLElement) => {
  Object.defineProperty(element, 'clientHeight', { configurable: true, value: 300 });
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: 900 });
  Object.defineProperty(element, 'scrollTop', { configurable: true, value: 600, writable: true });
  fireEvent.scroll(element);
};

describe('RegistrationAgreementDialog', () => {
  it('unlocks each agreement only after its own document reaches the end', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();

    render(
      <MUIStyleProvider>
        <RegistrationAgreementDialog onAccept={onAccept} onClose={vi.fn()} open />
      </MUIStyleProvider>,
    );

    const termsCheckbox = screen.getByRole('checkbox', { name: 'I agree to the Terms of Use.' });
    const privacyCheckbox = screen.getByRole('checkbox', { name: 'I acknowledge that I have read the Privacy Policy.' });
    const createButton = screen.getByRole('button', { name: 'Agree and create account' });

    expect(termsCheckbox).toBeDisabled();
    expect(privacyCheckbox).toBeDisabled();
    expect(createButton).toBeDisabled();
    expect(screen.getByText('Read the Terms of Use to the end before checking this box.')).toBeInTheDocument();
    expect(screen.getByText('Read the Privacy Policy to the end before checking this box.')).toBeInTheDocument();

    markViewportAtEnd(screen.getByRole('region', { name: 'Terms of Use' }));

    expect(termsCheckbox).toBeEnabled();
    expect(privacyCheckbox).toBeDisabled();
    expect(screen.getByText('You can now confirm your agreement to the Terms of Use.')).toBeInTheDocument();

    await user.click(termsCheckbox);
    expect(createButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Privacy Policy' }));
    expect(screen.getByText('Please read to the end of the Privacy Policy. Once you reach the end, you can confirm it below.')).toBeInTheDocument();

    markViewportAtEnd(screen.getByRole('region', { name: 'Privacy Policy' }));

    expect(termsCheckbox).toBeEnabled();
    expect(privacyCheckbox).toBeEnabled();
    expect(screen.getByText('You can now confirm that you have read the Privacy Policy.')).toBeInTheDocument();

    await user.click(privacyCheckbox);
    expect(createButton).toBeEnabled();

    await user.click(createButton);
    expect(onAccept).toHaveBeenCalledTimes(1);
  });


  it('allows Escape to request closing when account creation is not in progress', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <MUIStyleProvider>
        <RegistrationAgreementDialog onAccept={vi.fn()} onClose={onClose} open />
      </MUIStyleProvider>,
    );

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close from Escape while account creation is in progress', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <MUIStyleProvider>
        <RegistrationAgreementDialog onAccept={vi.fn()} onClose={onClose} open working />
      </MUIStyleProvider>,
    );

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
