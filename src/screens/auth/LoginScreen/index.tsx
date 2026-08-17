'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Notice from '@/components/ui/Notice';
import { loadCurrentAppSession, signOutCurrentUser } from '@/lib/auth/client';
import { ROLE_DESTINATIONS } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/store';
import { resolveSafeNextPath } from '@/utils';
import AuthScaffold from '../AuthScaffold';
import type { LoginFormValues, LoginScreenProps } from './interface';
import {
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
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password: z.string().min(1, 'Enter your password.').max(72, 'The password is too long.'),
});

export default function LoginScreen({ nextPath }: LoginScreenProps) {
  const router = useRouter();
  const syncAuthSession = useAppStore((state) => state.commands.syncAuthSession);
  const clearAuthSession = useAppStore((state) => state.commands.signOut);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });

    if (error) {
      setSubmissionError(
        error.status === 429
          ? 'Too many sign-in attempts. Please wait a moment and try again.'
          : 'The email or password is incorrect. Check your details and try again.',
      );
      return;
    }

    const current = await loadCurrentAppSession(supabase);
    if (!current.session) {
      await signOutCurrentUser();
      clearAuthSession();
      setSubmissionError(
        current.profile?.status === 'inactive'
          ? 'This account is currently unavailable.'
          : 'Your account profile could not be loaded. Please contact the administrator.',
      );
      return;
    }

    syncAuthSession({ session: current.session, phone: current.profile?.phone });
    const destination = current.session.user.role === 'customer'
      ? resolveSafeNextPath(nextPath, ROLE_DESTINATIONS.customer)
      : ROLE_DESTINATIONS[current.session.user.role];

    router.replace(destination);
    router.refresh();
  });

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
          slotProps={{ htmlInput: { autoCapitalize: 'none', maxLength: 254, spellCheck: false } }}
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
            htmlInput: { autoCapitalize: 'none', maxLength: 72, spellCheck: false },
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
          <TextLink href={`/register?next=${encodeURIComponent(resolveSafeNextPath(nextPath, '/customer/account'))}`}>
            Create a customer account
          </TextLink>
        </FormLinks>
      </Form>
    </AuthScaffold>
  );
}
