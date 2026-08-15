'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
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
  DemoCopy,
  DemoEmail,
  DemoHeader,
  DemoIntro,
  DemoList,
  DemoRole,
  DemoRow,
  DemoSection,
  DemoTitle,
  DemoUseButton,
  ErrorRegion,
  Field,
  Form,
  FormLinks,
  PasswordAdornment,
  PasswordToggle,
  PrototypeNotice,
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
  deliverer: '/deliverer/deliveries',
} as const;

const demoCredentials: DemoCredentialView[] = DEMO_AUTH_ACCOUNTS.map((account) => ({
  email: account.email,
  password: account.demoPassword,
  roleLabel:
    account.role === 'customer' ? 'Customer' : account.role === 'admin' ? 'Admin' : 'Deliverer',
}));

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAppStore((state) => state.commands.signIn);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setFocus,
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

    router.push(roleDestinations[result.value.user.role]);
  });

  const useDemoAccount = (credential: DemoCredentialView) => {
    setSubmissionError(null);
    setValue('email', credential.email, { shouldDirty: true, shouldValidate: true });
    setValue('password', credential.password, { shouldDirty: true, shouldValidate: true });
    setFocus('password');
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
          <TextLink href="/register">Create a customer account</TextLink>
        </FormLinks>
      </Form>

      <DemoSection aria-labelledby="prototype-access-title">
        <DemoHeader>
          <DemoTitle id="prototype-access-title">Prototype access</DemoTitle>
          <DemoIntro>
            Use a fictional account to review each workspace during the frontend-only phase.
          </DemoIntro>
        </DemoHeader>
        <DemoList>
          {demoCredentials.map((credential) => (
            <DemoRow key={credential.email}>
              <DemoCopy>
                <DemoRole>{credential.roleLabel}</DemoRole>
                <DemoEmail>{credential.email}</DemoEmail>
              </DemoCopy>
              <DemoUseButton onClick={() => useDemoAccount(credential)}>
                Use demo
              </DemoUseButton>
            </DemoRow>
          ))}
        </DemoList>
        <PrototypeNotice>
          Demo credentials are fictional and are not production authentication or security controls.
        </PrototypeNotice>
      </DemoSection>
    </AuthScaffold>
  );
}
