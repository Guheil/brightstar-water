'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Notice from '@/components/ui/Notice';
import { DEMO_AUTH_ACCOUNTS } from '@/mocks';
import { useAppStore } from '@/store';
import AuthScaffold from '../AuthScaffold';
import type { DemoCredentialView, LoginFormValues } from './interface';
import {
  CredentialEmail,
  CredentialList,
  CredentialRole,
  CredentialRow,
  DemoIntro,
  DemoSection,
  DemoTitle,
  ErrorRegion,
  Form,
  FormLinks,
  PasswordHint,
  SubmitButton,
  TextLink,
} from './elements';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid demo email address.'),
  password: z.string().min(1, 'Enter the demo password.'),
});

const roleDestinations = {
  customer: '/customer/account',
  admin: '/admin/overview',
  deliverer: '/deliverer/deliveries',
} as const;

const demoCredentials: DemoCredentialView[] = DEMO_AUTH_ACCOUNTS.map(
  (account) => ({
    email: account.email,
    roleLabel:
      account.role === 'customer'
        ? 'Customer'
        : account.role === 'admin'
          ? 'Admin'
          : 'Deliverer',
  }),
);

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAppStore((state) => state.commands.signIn);
  const prototypeNotice = useAppStore((state) => state.auth.prototypeNotice);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: 'customer.demo@example.test',
      password: 'demo-only',
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError(null);
    await new Promise((resolve) => setTimeout(resolve, 280));
    const result = signIn(values);

    if (!result.ok) {
      setSubmissionError(result.error.message);
      return;
    }

    router.push(roleDestinations[result.value.user.role]);
  });

  return (
    <AuthScaffold
      description="Use one of the public presentation accounts below. This sign-in only changes frontend demo state."
      title="Sign in to the prototype"
    >
      <Notice title="Frontend demonstration" tone="warning">
        {prototypeNotice} Never enter a real password or personal email here.
      </Notice>
      <Form
        aria-busy={isSubmitting}
        aria-label="Prototype sign in"
        noValidate
        onSubmit={onSubmit}
      >
        {submissionError ? (
          <ErrorRegion>
            <Notice title="Sign-in failed" tone="error">
              {submissionError}
            </Notice>
          </ErrorRegion>
        ) : null}
        <TextField
          autoComplete="username"
          error={Boolean(errors.email)}
          fullWidth
          helperText={errors.email?.message}
          label="Demo email"
          type="email"
          {...register('email')}
        />
        <TextField
          autoComplete="current-password"
          error={Boolean(errors.password)}
          fullWidth
          helperText={errors.password?.message}
          label="Demo password"
          type="password"
          {...register('password')}
        />
        <SubmitButton disabled={isSubmitting} type="submit" variant="contained">
          {isSubmitting ? 'Checking demo account…' : 'Sign in'}
        </SubmitButton>
        <FormLinks>
          <TextLink href="/forgot-password">Forgot demo password?</TextLink>
          <TextLink href="/register">Create a demo customer account</TextLink>
        </FormLinks>
      </Form>
      <DemoSection aria-labelledby="demo-accounts-title">
        <DemoTitle id="demo-accounts-title">Presentation accounts</DemoTitle>
        <DemoIntro>
          These fixed addresses are fictional and cannot receive email.
        </DemoIntro>
        <CredentialList>
          {demoCredentials.map((credential) => (
            <CredentialRow key={credential.email}>
              <CredentialRole>{credential.roleLabel}</CredentialRole>
              <CredentialEmail>{credential.email}</CredentialEmail>
            </CredentialRow>
          ))}
        </CredentialList>
        <PasswordHint>
          Shared public demo password: <strong>demo-only</strong>
        </PasswordHint>
      </DemoSection>
    </AuthScaffold>
  );
}
