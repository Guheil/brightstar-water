'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Notice from '@/components/ui/Notice';
import AuthScaffold from '../AuthScaffold';
import type { ForgotPasswordFormValues } from './interface';
import {
  FooterText,
  Form,
  SubmitButton,
  SuccessRegion,
  TextLink,
} from './elements';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .refine(
      (value) => value.toLocaleLowerCase().endsWith('.test'),
      'This email address is not eligible for password recovery.',
    ),
});

export default function ForgotPasswordScreen() {
  const [requested, setRequested] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: '' },
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 280));
    setRequested(true);
  });

  return (
    <AuthScaffold
      description="Enter your account email to begin password recovery."
      title="Reset your password"
    >
      {requested ? (
        <SuccessRegion>
          <Notice title="Recovery request received" tone="success">
            Your request has been accepted. Return to sign in when you are ready.
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
          <TextField
            autoComplete="off"
            error={Boolean(errors.email)}
            fullWidth
            helperText={errors.email?.message ?? 'Enter the email address for your account.'}
            label="Email"
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
