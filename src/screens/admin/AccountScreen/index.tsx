'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Notice from '@/components/ui/Notice';
import { signOutCurrentUser } from '@/lib/auth/client';
import {
  accountEmailChangeSchema,
  accountPasswordChangeSchema,
} from '@/lib/auth/accountSecurityValidation';
import { useAppStore } from '@/store';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDateTime, humanize } from '../utils';
import {
  DetailList,
  DetailSection,
  DetailTerm,
  DetailValue,
  FormActions,
  FormField,
  Root,
  SectionCopy,
  SectionDescription,
  SectionTitle,
  SecurityForm,
  SecuritySection,
  SubmitButton,
} from './elements';
import type { AccountScreenProps } from './interface';

type Feedback = {
  message: string;
  title: string;
  tone: 'success' | 'error' | 'info';
};

export default function AccountScreen({ className }: AccountScreenProps) {
  const router = useRouter();
  const session = useAppStore((state) => state.auth.session);
  const clearAuthSession = useAppStore((state) => state.commands.signOut);
  const currentEmail = session?.user.email ?? '';

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<Feedback | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback | null>(null);

  const handleEmailChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailFeedback(null);

    const parsed = accountEmailChangeSchema.safeParse({
      currentPassword: emailPassword,
      newEmail,
    });

    if (!parsed.success) {
      setEmailFeedback({
        message: parsed.error.issues[0]?.message ?? 'Check the email details and try again.',
        title: 'Email not updated',
        tone: 'error',
      });
      return;
    }

    if (currentEmail && parsed.data.newEmail === currentEmail.toLowerCase()) {
      setEmailFeedback({
        message: 'Enter an email address that is different from your current login email.',
        title: 'Email not updated',
        tone: 'error',
      });
      return;
    }

    setEmailSubmitting(true);
    try {
      const response = await fetch('/api/account/email', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as {
        changed?: boolean;
        error?: string;
        message?: string;
        newEmail?: string;
      };

      if (!response.ok || !result.changed) {
        setEmailFeedback({
          message: result.error ?? 'The login email could not be changed.',
          title: 'Email not updated',
          tone: 'error',
        });
        return;
      }

      setEmailPassword('');
      setNewEmail('');

      try {
        await signOutCurrentUser();
      } catch {
        // The credential change already succeeded. Clear local app state below
        // even if the old browser session cannot be explicitly revoked here.
      }

      clearAuthSession();
      router.replace('/login?emailChanged=1');
      router.refresh();
      return;
    } catch {
      setEmailFeedback({
        message: 'The login email could not be changed. Check your connection and try again.',
        title: 'Email not updated',
        tone: 'error',
      });
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordFeedback(null);

    const parsed = accountPasswordChangeSchema.safeParse({
      confirmPassword,
      currentPassword,
      newPassword,
    });

    if (!parsed.success) {
      setPasswordFeedback({
        message: parsed.error.issues[0]?.message ?? 'Check the password details and try again.',
        title: 'Password not changed',
        tone: 'error',
      });
      return;
    }

    setPasswordSubmitting(true);
    try {
      const response = await fetch('/api/account/password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as {
        changed?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !result.changed) {
        setPasswordFeedback({
          message: result.error ?? 'The password could not be changed.',
          title: 'Password not changed',
          tone: 'error',
        });
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback({
        message: result.message ?? 'Your password has been changed.',
        title: 'Password changed',
        tone: 'success',
      });
    } catch {
      setPasswordFeedback({
        message: 'The password could not be changed. Check your connection and try again.',
        title: 'Password not changed',
        tone: 'error',
      });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Review your administrator profile and manage the credentials used to sign in."
        title="Admin account"
      />

      <DetailSection>
        <SectionCopy>
          <SectionTitle>Account details</SectionTitle>
          <SectionDescription>
            These details identify the administrator currently signed in to this dashboard.
          </SectionDescription>
        </SectionCopy>
        <DetailList>
          <DetailTerm>Display name</DetailTerm>
          <DetailValue>{session?.user.displayName ?? 'Administrator'}</DetailValue>
          <DetailTerm>Login email</DetailTerm>
          <DetailValue>{currentEmail || 'Not available'}</DetailValue>
          <DetailTerm>Role</DetailTerm>
          <DetailValue>{humanize(session?.user.role ?? 'admin')}</DetailValue>
          <DetailTerm>Signed in</DetailTerm>
          <DetailValue>
            {session?.signedInAt ? formatDateTime(session.signedInAt) : 'Not recorded'}
          </DetailValue>
        </DetailList>
      </DetailSection>

      <SecuritySection>
        <SectionCopy>
          <SectionTitle>Change login email</SectionTitle>
          <SectionDescription>
            This is the email used to sign in to your account. Enter your current password before changing it. You will need to sign in again after the change.
          </SectionDescription>
        </SectionCopy>

        <SecurityForm onSubmit={handleEmailChange}>
          {emailFeedback ? (
            <Notice title={emailFeedback.title} tone={emailFeedback.tone}>
              {emailFeedback.message}
            </Notice>
          ) : null}
          <FormField
            autoComplete="email"
            disabled
            label="Current email"
            type="email"
            value={currentEmail}
          />
          <FormField
            autoComplete="email"
            disabled={emailSubmitting}
            helperText="Use a valid email format, such as admin@example.com."
            label="New login email"
            onChange={(event) => setNewEmail(event.target.value)}
            required
            type="email"
            value={newEmail}
          />
          <FormField
            autoComplete="current-password"
            disabled={emailSubmitting}
            label="Current password"
            onChange={(event) => setEmailPassword(event.target.value)}
            required
            type="password"
            value={emailPassword}
          />
          <FormActions>
            <SubmitButton
              disabled={emailSubmitting || !session}
              type="submit"
              variant="contained"
            >
              {emailSubmitting ? 'Changing login email...' : 'Change login email'}
            </SubmitButton>
          </FormActions>
        </SecurityForm>
      </SecuritySection>

      <SecuritySection>
        <SectionCopy>
          <SectionTitle>Change password</SectionTitle>
          <SectionDescription>
            Enter the password you use now, then choose a different password with at least 8 characters.
          </SectionDescription>
        </SectionCopy>

        <SecurityForm onSubmit={handlePasswordChange}>
          {passwordFeedback ? (
            <Notice title={passwordFeedback.title} tone={passwordFeedback.tone}>
              {passwordFeedback.message}
            </Notice>
          ) : null}
          <FormField
            autoComplete="current-password"
            disabled={passwordSubmitting}
            label="Current password"
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            type="password"
            value={currentPassword}
          />
          <FormField
            autoComplete="new-password"
            disabled={passwordSubmitting}
            helperText="Use at least 8 characters."
            label="New password"
            onChange={(event) => setNewPassword(event.target.value)}
            required
            type="password"
            value={newPassword}
          />
          <FormField
            autoComplete="new-password"
            disabled={passwordSubmitting}
            label="Confirm new password"
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
          <FormActions>
            <SubmitButton
              disabled={passwordSubmitting || !session}
              type="submit"
              variant="contained"
            >
              {passwordSubmitting ? 'Changing password...' : 'Change password'}
            </SubmitButton>
          </FormActions>
        </SecurityForm>
      </SecuritySection>
    </Root>
  );
}
