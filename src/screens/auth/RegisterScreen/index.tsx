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
      .min(2, 'Enter a fictional display name.')
      .max(60, 'Keep the display name under 60 characters.'),
    email: z
      .string()
      .trim()
      .email('Enter a valid fictional email address.')
      .refine(
        (value) => value.toLocaleLowerCase().endsWith('.test'),
        'Use a reserved .test address, not a real email.',
      ),
    password: z
      .string()
      .min(8, 'Use at least 8 characters for the demo password.')
      .max(72, 'Keep the demo password under 72 characters.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'The demo passwords do not match.',
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
      description="Create a temporary Customer presentation profile. The form never sends or stores these values."
      title="Create a demo customer account"
    >
      <Notice title="Use fictional details only" tone="warning">
        Enter a made-up name and a reserved .test email. Do not submit a real
        identity, password, phone number, or address.
      </Notice>
      {created ? (
        <SuccessRegion>
          <Notice title="Demo registration complete" tone="success">
            The validation flow completed locally. No account was saved and no
            email was sent.
          </Notice>
          <TextLink href="/login">Return to presentation sign in</TextLink>
        </SuccessRegion>
      ) : (
        <Form
          aria-busy={isSubmitting}
          aria-label="Demo customer registration"
          noValidate
          onSubmit={onSubmit}
        >
          <TextField
            autoComplete="off"
            error={Boolean(errors.displayName)}
            fullWidth
            helperText={errors.displayName?.message}
            label="Fictional display name"
            {...register('displayName')}
          />
          <TextField
            autoComplete="off"
            error={Boolean(errors.email)}
            fullWidth
            helperText={errors.email?.message ?? 'Example: new.customer@example.test'}
            label="Fictional .test email"
            type="email"
            {...register('email')}
          />
          <TextField
            autoComplete="new-password"
            error={Boolean(errors.password)}
            fullWidth
            helperText={errors.password?.message}
            label="Temporary demo password"
            type="password"
            {...register('password')}
          />
          <TextField
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            fullWidth
            helperText={errors.confirmPassword?.message}
            label="Confirm temporary demo password"
            type="password"
            {...register('confirmPassword')}
          />
          <SubmitButton disabled={isSubmitting} type="submit" variant="contained">
            {isSubmitting ? 'Validating locally…' : 'Complete demo registration'}
          </SubmitButton>
        </Form>
      )}
      <FooterText>
        Already using a presentation account?{' '}
        <TextLink href="/login">Sign in</TextLink>
      </FooterText>
    </AuthScaffold>
  );
}
