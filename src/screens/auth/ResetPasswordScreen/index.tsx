'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Notice from '@/components/ui/Notice';
import { passwordRecoveryCompletionSchema } from '@/lib/auth/passwordRecoveryValidation';
import AuthScaffold from '../AuthScaffold';
import type { ResetPasswordFormValues } from './interface';
import {
  ErrorRegion,
  Form,
  PasswordAdornment,
  PasswordToggle,
  SecurityHint,
  SubmitButton,
} from './elements';

interface CompletionResult {
  changed?: boolean;
  error?: string;
  issues?: { field: string; message: string }[];
  revocationPending?: boolean;
}

export default function ResetPasswordScreen() {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { confirmPassword: '', newPassword: '' },
    resolver: zodResolver(passwordRecoveryCompletionSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError(null);
    try {
      const response = await fetch('/api/auth/password-recovery/complete', {
        body: JSON.stringify(values),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const result = (await response.json().catch(() => null)) as CompletionResult | null;

      if (!response.ok || !result?.changed) {
        result?.issues?.forEach((issue) => {
          if (issue.field === 'newPassword' || issue.field === 'confirmPassword') {
            setError(issue.field, { message: issue.message });
          }
        });
        setSubmissionError(result?.error ?? 'Your password could not be reset right now.');
        return;
      }

      // Completion revokes and clears the recovery credentials. Deliberately
      // perform a full, history-replacing navigation instead of an RSC fetch,
      // so Next does not race its client router against that cookie boundary.
      window.location.replace(
        `/login?passwordReset=1${result.revocationPending ? '&recoveryNotice=1' : ''}`,
      );
    } catch {
      setSubmissionError('Your password could not be reset right now. Check your connection and try again.');
    }
  });

  return (
    <AuthScaffold
      description="Choose a new password for your account. This recovery session cannot access your ordinary workspace."
      title="Create a new password"
    >
      <Form aria-busy={isSubmitting} aria-label="Create a new password" noValidate onSubmit={onSubmit}>
        {submissionError ? (
          <ErrorRegion>
            <Notice title="Password reset could not continue" tone="error">
              {submissionError}
            </Notice>
          </ErrorRegion>
        ) : null}

        <TextField
          autoComplete="new-password"
          error={Boolean(errors.newPassword)}
          fullWidth
          helperText={errors.newPassword?.message ?? 'Use at least 15 characters.'}
          label="New password"
          slotProps={{
            htmlInput: { maxLength: 72 },
            input: {
              endAdornment: (
                <PasswordAdornment position="end">
                  <PasswordToggle
                    aria-label={showPassword ? 'Hide new password' : 'Show new password'}
                    edge="end"
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                  </PasswordToggle>
                </PasswordAdornment>
              ),
            },
          }}
          type={showPassword ? 'text' : 'password'}
          {...register('newPassword')}
        />
        <TextField
          autoComplete="new-password"
          error={Boolean(errors.confirmPassword)}
          fullWidth
          helperText={errors.confirmPassword?.message}
          label="Confirm new password"
          slotProps={{ htmlInput: { maxLength: 72 } }}
          type={showPassword ? 'text' : 'password'}
          {...register('confirmPassword')}
        />
        <SecurityHint>
          When the reset succeeds, this temporary session is ended and you will sign in again with the new password.
        </SecurityHint>
        <SubmitButton disabled={isSubmitting} type="submit" variant="contained">
          {isSubmitting ? 'Saving password…' : 'Save new password'}
        </SubmitButton>
      </Form>
    </AuthScaffold>
  );
}
