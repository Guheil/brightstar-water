'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Notice from '@/components/ui/Notice';
import AuthScaffold from '../AuthScaffold';
import type { RegisterFormValues } from './interface';
import {
  FooterText,
  Form,
  SubmitButton,
  SuccessRegion,
  TextLink,
} from './elements';

const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Enter your display name.')
      .max(60, 'Keep the display name under 60 characters.'),
    email: z
      .string()
      .trim()
      .email('Enter a valid email address.')
      .refine(
        (value) => value.toLocaleLowerCase().endsWith('.test'),
        'This email address cannot be used for registration.',
      ),
    password: z
      .string()
      .min(8, 'Use at least 8 characters for your password.')
      .max(72, 'Keep the password under 72 characters.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'The passwords do not match.',
    path: ['confirmPassword'],
  });

export default function RegisterScreen() {
  const [created, setCreated] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 320));
    setCreated(true);
  });

  return (
    <AuthScaffold
      description="Set up your customer profile for ordering and delivery management."
      title="Create a customer account"
    >
      {created ? (
        <SuccessRegion>
          <Notice title="Registration details accepted" tone="success">
            Your information passed validation. Return to sign in to continue.
          </Notice>
          <TextLink href="/login">Return to sign in</TextLink>
        </SuccessRegion>
      ) : (
        <Form
          aria-busy={isSubmitting}
          aria-label="Customer registration"
          noValidate
          onSubmit={onSubmit}
        >
          <TextField
            autoComplete="off"
            error={Boolean(errors.displayName)}
            fullWidth
            helperText={errors.displayName?.message}
            label="Display name"
            {...register('displayName')}
          />
          <TextField
            autoComplete="off"
            error={Boolean(errors.email)}
            fullWidth
            helperText={errors.email?.message ?? 'Enter the email address for your account.'}
            label="Email"
            type="email"
            {...register('email')}
          />
          <TextField
            autoComplete="new-password"
            error={Boolean(errors.password)}
            fullWidth
            helperText={errors.password?.message}
            label="Password"
            type="password"
            {...register('password')}
          />
          <TextField
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            fullWidth
            helperText={errors.confirmPassword?.message}
            label="Confirm password"
            type="password"
            {...register('confirmPassword')}
          />
          <SubmitButton disabled={isSubmitting} type="submit" variant="contained">
            {isSubmitting ? 'Submitting…' : 'Create account'}
          </SubmitButton>
        </Form>
      )}
      <FooterText>
        Already have an account?{' '}
        <TextLink href="/login">Sign in</TextLink>
      </FooterText>
    </AuthScaffold>
  );
}
