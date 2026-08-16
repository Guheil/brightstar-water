'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Notice from '@/components/ui/Notice';
import { AUTH_ACCOUNTS } from '@/data';
import { useAppStore } from '@/store';
import { resolveSafeNextPath } from '@/utils';
import AuthScaffold from '../AuthScaffold';
import type { DemoAccessAccount, LoginFormValues, LoginScreenProps } from './interface';
import {
  DemoAccess,
  DemoAccessHint,
  DemoAccessList,
  DemoAccessRow,
  DemoAccessSummary,
  DemoAccountEmail,
  DemoAccountName,
  DemoUseButton,
  ErrorRegion,
  Field,
  Form,
  FormLinks,
  PasswordAdornment,
  PasswordToggle,
  SubmitButton,
  TextLink,
} from './elements';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

const roleDestinations = {
  customer: '/customer/account',
  admin: '/admin/overview',
  deliverer: '/deliverer',
} as const;

const roleLabels = {
  customer: 'Customer',
  admin: 'Administrator',
  deliverer: 'Deliverer',
} as const;

const demoAccounts: readonly DemoAccessAccount[] = AUTH_ACCOUNTS.map((account) => ({
  email: account.email,
  label: roleLabels[account.role],
  password: account.password,
  role: account.role,
}));

export default function LoginScreen({ nextPath }: LoginScreenProps) {
  const router = useRouter();
  const signIn = useAppStore((state) => state.commands.signIn);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError(null);
    await new Promise((resolve) => setTimeout(resolve, 280));
    const result = signIn(values);

    if (!result.ok) {
      setSubmissionError('The email or password is incorrect. Check your details and try again.');
      return;
    }

    const destination = result.value.user.role === 'customer'
      ? resolveSafeNextPath(nextPath, roleDestinations.customer)
      : roleDestinations[result.value.user.role];
    router.push(destination);
  });

  const applyDemoAccount = (account: DemoAccessAccount) => {
    setSubmissionError(null);
    setValue('email', account.email, { shouldDirty: true, shouldValidate: true });
    setValue('password', account.password, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <AuthScaffold
      description="Enter your account credentials. Your account determines whether you continue to the customer, administrator, or delivery workspace."
      title="Sign in"
    >
      <Form aria-busy={isSubmitting} aria-label="Account sign in" noValidate onSubmit={onSubmit}>
        {submissionError ? (
          <ErrorRegion>
            <Notice title="Sign-in failed" tone="error">
              {submissionError}
            </Notice>
          </ErrorRegion>
        ) : null}

        <Field
          autoComplete="username"
          error={Boolean(errors.email)}
          fullWidth
          helperText={errors.email?.message}
          label="Email address"
          slotProps={{ htmlInput: { autoCapitalize: 'none', spellCheck: false } }}
          type="email"
          {...register('email')}
        />
        <Field
          autoComplete="current-password"
          error={Boolean(errors.password)}
          fullWidth
          helperText={errors.password?.message}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          slotProps={{
            htmlInput: { autoCapitalize: 'none', spellCheck: false },
            input: {
              endAdornment: (
                <PasswordAdornment position="end">
                  <PasswordToggle
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
          {...register('password')}
        />

        <SubmitButton disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </SubmitButton>
        <FormLinks>
          <TextLink href="/forgot-password">Forgot password?</TextLink>
          <TextLink href={`/register?next=${encodeURIComponent(resolveSafeNextPath(nextPath, '/customer/account'))}`}>Create a customer account</TextLink>
        </FormLinks>

        <DemoAccess>
          <DemoAccessSummary>Demo access</DemoAccessSummary>
          <DemoAccessHint>Use an account shortcut when reviewing each workspace.</DemoAccessHint>
          <DemoAccessList>
            {demoAccounts.map((account) => (
              <DemoAccessRow key={account.role}>
                <div>
                  <DemoAccountName>{account.label}</DemoAccountName>
                  <DemoAccountEmail>{account.email}</DemoAccountEmail>
                </div>
                <DemoUseButton onClick={() => applyDemoAccount(account)} type="button">
                  Use
                </DemoUseButton>
              </DemoAccessRow>
            ))}
          </DemoAccessList>
        </DemoAccess>
      </Form>
    </AuthScaffold>
  );
}
