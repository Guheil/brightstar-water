'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Notice from '@/components/ui/Notice';
import { useAppStore } from '@/store';
import { resolveSafeNextPath } from '@/utils';
import AuthScaffold from '../AuthScaffold';
import type { RegisterFormValues, RegisterScreenProps, RegistrationStage } from './interface';
import {
  REGISTRATION_OTP_LENGTH,
  applyOtpDigits,
  createEmptyOtpDigits,
  replaceOtpFromPaste,
  sanitizeOtpDigits,
} from './utils';
import {
  ActionRow,
  CodeLabel,
  CodePanel,
  CodeValue,
  Field,
  FooterText,
  Form,
  InlineActions,
  OtpCell,
  OtpCells,
  PrimaryButton,
  ProgressItem,
  ProgressList,
  SecondaryButton,
  StepText,
  StepTitle,
  TextLink,
} from './elements';

const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Enter your name.').max(60, 'Keep your name under 60 characters.'),
    email: z.string().trim().email('Enter a valid email address.'),
    phone: z.string().trim().regex(/^09[0-9\s-]{9,13}$/, 'Enter a valid Philippine mobile number.'),
    password: z.string().min(8, 'Use at least 8 characters.').max(72, 'Keep your password under 72 characters.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'The passwords do not match.',
    path: ['confirmPassword'],
  });

const stages: readonly { id: RegistrationStage; label: string }[] = [
  { id: 'details', label: 'Your details' },
  { id: 'security', label: 'Password' },
  { id: 'verify', label: 'Verify email' },
];

export default function RegisterScreen({ nextPath }: RegisterScreenProps) {
  const router = useRouter();
  const beginRegistration = useAppStore((state) => state.commands.beginCustomerRegistration);
  const resendVerification = useAppStore((state) => state.commands.resendCustomerVerification);
  const verifyRegistration = useAppStore((state) => state.commands.verifyCustomerRegistration);
  const cancelRegistration = useAppStore((state) => state.commands.cancelCustomerRegistration);
  const pendingRegistration = useAppStore((state) => state.auth.pendingRegistration);
  const [stage, setStage] = useState<RegistrationStage>('details');
  const [verificationDigits, setVerificationDigits] = useState<string[]>(createEmptyOtpDigits);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const {
    formState: { errors },
    getValues,
    register,
    trigger,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      displayName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const stageIndex = stages.findIndex((item) => item.id === stage);
  const verificationCode = verificationDigits.join('');

  const clearVerificationCode = (focusFirst = false) => {
    setVerificationDigits(createEmptyOtpDigits());
    if (focusFirst) requestAnimationFrame(() => otpRefs.current[0]?.focus());
  };

  const placeOtpDigits = (startIndex: number, rawValue: string) => {
    const digits = sanitizeOtpDigits(rawValue, REGISTRATION_OTP_LENGTH - startIndex);
    setVerificationDigits((current) => applyOtpDigits(current, startIndex, rawValue));
    if (!digits) return;

    const nextIndex = Math.min(startIndex + digits.length, REGISTRATION_OTP_LENGTH - 1);
    requestAnimationFrame(() => otpRefs.current[nextIndex]?.focus());
  };

  const handleOtpChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    placeOtpDigits(index, event.target.value);
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      otpRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === 'ArrowRight' && index < REGISTRATION_OTP_LENGTH - 1) {
      event.preventDefault();
      otpRefs.current[index + 1]?.focus();
      return;
    }

    if (event.key === 'Backspace' && !verificationDigits[index] && index > 0) {
      event.preventDefault();
      setVerificationDigits((current) => {
        const next = [...current];
        next[index - 1] = '';
        return next;
      });
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const digits = sanitizeOtpDigits(event.clipboardData.getData('text'));
    if (!digits) return;
    event.preventDefault();
    setVerificationDigits(replaceOtpFromPaste(digits));
    requestAnimationFrame(() => otpRefs.current[Math.min(digits.length, REGISTRATION_OTP_LENGTH) - 1]?.focus());
  };

  const continueFromDetails = async () => {
    setFeedback(null);
    const valid = await trigger(['displayName', 'email', 'phone']);
    if (valid) setStage('security');
  };

  const continueFromSecurity = async () => {
    setFeedback(null);
    const valid = await trigger(['password', 'confirmPassword']);
    if (!valid) return;
    setWorking(true);
    const values = getValues();
    const result = beginRegistration({
      displayName: values.displayName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });
    setWorking(false);
    if (!result.ok) {
      setFeedback(result.error.message);
      return;
    }
    clearVerificationCode();
    setStage('verify');
    requestAnimationFrame(() => otpRefs.current[0]?.focus());
  };

  const verifyEmail = () => {
    setFeedback(null);
    setWorking(true);
    const result = verifyRegistration(verificationCode);
    setWorking(false);
    if (!result.ok) {
      setFeedback(result.error.message);
      return;
    }
    router.push(resolveSafeNextPath(nextPath, '/customer/account'));
  };

  const resendCode = () => {
    setFeedback(null);
    const result = resendVerification();
    if (!result.ok) setFeedback(result.error.message);
    else clearVerificationCode(true);
  };

  const backFromVerification = () => {
    cancelRegistration();
    clearVerificationCode();
    setFeedback(null);
    setStage('security');
  };

  return (
    <AuthScaffold
      description="Create your customer account, verify your email, then continue to ordering and delivery."
      title="Create a customer account"
    >
      <ProgressList aria-label="Registration progress">
        {stages.map((item, index) => (
          <ProgressItem
            aria-current={item.id === stage ? 'step' : undefined}
            key={item.id}
            $active={item.id === stage}
            $complete={index < stageIndex}
          >
            {item.label}
          </ProgressItem>
        ))}
      </ProgressList>

      {feedback ? <Notice title="Could not continue" tone="error">{feedback}</Notice> : null}

      {stage === 'details' ? (
        <Form aria-label="Customer account details" noValidate onSubmit={(event) => event.preventDefault()}>
          <StepTitle>Tell us where we can reach you</StepTitle>
          <StepText>Your email will be verified before the account is created.</StepText>
          <Field
            autoComplete="name"
            error={Boolean(errors.displayName)}
            helperText={errors.displayName?.message}
            label="Full name"
            {...register('displayName')}
          />
          <Field
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            label="Email address"
            type="email"
            {...register('email')}
          />
          <Field
            autoComplete="tel"
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            label="Mobile number"
            inputMode="tel"
            {...register('phone')}
          />
          <ActionRow>
            <span />
            <PrimaryButton onClick={continueFromDetails} type="button" variant="contained">Continue</PrimaryButton>
          </ActionRow>
        </Form>
      ) : null}

      {stage === 'security' ? (
        <Form aria-label="Create account password" noValidate onSubmit={(event) => event.preventDefault()}>
          <StepTitle>Create your password</StepTitle>
          <StepText>Use a password you do not reuse on other accounts.</StepText>
          <Field
            autoComplete="new-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            label="Password"
            type="password"
            {...register('password')}
          />
          <Field
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            label="Confirm password"
            type="password"
            {...register('confirmPassword')}
          />
          <ActionRow>
            <SecondaryButton onClick={() => setStage('details')} type="button">Back</SecondaryButton>
            <PrimaryButton disabled={working} onClick={continueFromSecurity} type="button" variant="contained">
              {working ? 'Preparing verification…' : 'Continue to verification'}
            </PrimaryButton>
          </ActionRow>
        </Form>
      ) : null}

      {stage === 'verify' && pendingRegistration ? (
        <Form aria-label="Verify email address" noValidate onSubmit={(event) => event.preventDefault()}>
          <StepTitle>Check the verification code</StepTitle>
          <StepText>Enter the 6-digit code for {pendingRegistration.email}.</StepText>
          <CodePanel aria-live="polite">
            <CodeLabel>Verification code</CodeLabel>
            <CodeValue>{pendingRegistration.verificationCode}</CodeValue>
          </CodePanel>
          <OtpCells aria-label="6-digit verification code" role="group">
            {verificationDigits.map((digit, index) => (
              <OtpCell
                aria-label={`Verification code digit ${index + 1}`}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                inputMode="numeric"
                key={index}
                maxLength={REGISTRATION_OTP_LENGTH}
                onChange={(event) => handleOtpChange(index, event)}
                onFocus={(event) => event.currentTarget.select()}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                onPaste={handleOtpPaste}
                pattern="[0-9]*"
                ref={(element) => {
                  otpRefs.current[index] = element;
                }}
                type="text"
                value={digit}
              />
            ))}
          </OtpCells>
          <InlineActions>
            <SecondaryButton onClick={resendCode} type="button">Send a new code</SecondaryButton>
          </InlineActions>
          <ActionRow>
            <SecondaryButton onClick={backFromVerification} type="button">Back</SecondaryButton>
            <PrimaryButton disabled={working || verificationCode.length !== REGISTRATION_OTP_LENGTH} onClick={verifyEmail} type="button" variant="contained">
              {working ? 'Verifying…' : 'Verify and create account'}
            </PrimaryButton>
          </ActionRow>
        </Form>
      ) : null}

      <FooterText>
        Already have an account?{' '}
        <TextLink href={`/login?next=${encodeURIComponent(resolveSafeNextPath(nextPath, '/customer/account'))}`}>Sign in</TextLink>
      </FooterText>
    </AuthScaffold>
  );
}
