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
    .email('Enter a valid fictional email address.')
    .refine(
      (value) => value.toLocaleLowerCase().endsWith('.test'),
      'Use a reserved .test address, not a real email.',
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
      description="Demonstrate the recovery form without sending a message or changing any stored credential."
      title="Reset a demo password"
    >
      <Notice title="No email will be sent" tone="info">
        This frontend has no mail service or production identity system. Use a
        fictional .test address only.
      </Notice>
      {requested ? (
        <SuccessRegion>
          <Notice title="Demo request recorded" tone="success">
            The local recovery demonstration is complete. No account was
            changed and no reset link was created.
          </Notice>
          <TextLink href="/login">Return to presentation sign in</TextLink>
        </SuccessRegion>
      ) : (
        <Form
          aria-busy={isSubmitting}
          aria-label="Demo password recovery"
          noValidate
          onSubmit={onSubmit}
        >
          <TextField
            autoComplete="off"
            error={Boolean(errors.email)}
            fullWidth
            helperText={errors.email?.message ?? 'Example: customer.demo@example.test'}
            label="Fictional .test email"
            type="email"
            {...register('email')}
          />
          <SubmitButton disabled={isSubmitting} type="submit" variant="contained">
            {isSubmitting ? 'Checking locally…' : 'Demonstrate reset request'}
          </SubmitButton>
        </Form>
      )}
      <FooterText>
        Remember the presentation credential?{' '}
        <TextLink href="/login">Sign in</TextLink>
      </FooterText>
    </AuthScaffold>
  );
}
