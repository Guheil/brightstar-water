'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Notice from '@/components/ui/Notice';
import { passwordRecoveryRequestSchema } from '@/lib/auth/passwordRecoveryValidation';
import AuthScaffold from '../AuthScaffold';
import type { ForgotPasswordFormValues } from './interface';
import {
  FooterText,
  Form,
  SubmitButton,
  SuccessRegion,
  TextLink,
} from './elements';

export default function ForgotPasswordScreen() {
  const [requested, setRequested] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: '' },
    resolver: zodResolver(passwordRecoveryRequestSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setRequestError(null);
    try {
      const response = await fetch('/api/auth/password-recovery/request', {
        body: JSON.stringify({ email: values.email }),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setRequestError(result?.error ?? 'Password recovery could not be started right now.');
        return;
      }

      setRequested(true);
    } catch {
      setRequestError('Password recovery could not be started right now. Check your connection and try again.');
    }
  });

  return (
    <AuthScaffold
      description="Enter your account email to begin password recovery."
      title="Reset your password"
    >
      {requested ? (
        <SuccessRegion>
          <Notice title="Recovery request received" tone="success">
            If an account matches that email address, recovery instructions will arrive shortly.
          </Notice>
          <TextLink href="/login">Return to sign in</TextLink>
        </SuccessRegion>
      ) : (
        <Form
          aria-busy={isSubmitting}
          aria-label="Password recovery"
          noValidate
          onSubmit={onSubmit}
        >
          {requestError ? (
            <Notice title="Password recovery could not start" tone="error">
              {requestError}
            </Notice>
          ) : null}
          <TextField
            autoComplete="email"
            error={Boolean(errors.email)}
            fullWidth
            helperText={errors.email?.message ?? 'Enter the email address for your account.'}
            label="Email"
            slotProps={{ htmlInput: { autoCapitalize: 'none', maxLength: 254, spellCheck: false } }}
            type="email"
            {...register('email')}
          />
          <SubmitButton disabled={isSubmitting} type="submit" variant="contained">
            {isSubmitting ? 'Submitting…' : 'Submit request'}
          </SubmitButton>
        </Form>
      )}
      <FooterText>
        Remember your password?{' '}
        <TextLink href="/login">Sign in</TextLink>
      </FooterText>
    </AuthScaffold>
  );
}
