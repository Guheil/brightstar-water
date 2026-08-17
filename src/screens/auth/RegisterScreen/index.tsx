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
import RegistrationAgreementDialog from '@/components/legal/RegistrationAgreementDialog';
import Notice from '@/components/ui/Notice';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/config';
import { loadCurrentAppSession } from '@/lib/auth/client';
import { createClient } from '@/lib/supabase/client';
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
  LegalReviewList,
  LegalReviewRow,
  LegalReviewText,
  LegalVersion,
  TextLink,
} from './elements';

const safeName = /^[^<>\u0000-\u001F\u007F]+$/;
const normalizePhone = (value: string) => value.replace(/[\s-]/g, '');

const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Enter your name.')
      .max(60, 'Keep your name under 60 characters.')
      .regex(safeName, 'Remove unsupported characters from your name.'),
    email: z.string().trim().email('Enter a valid email address.').max(254),
    phone: z.string().trim().refine(
      (value) => /^09[0-9]{9}$/.test(normalizePhone(value)),
      'Enter a valid Philippine mobile number.',
    ),
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
  { id: 'agreement', label: 'Agreement' },
  { id: 'verify', label: 'Verify email' },
];

export default function RegisterScreen({ nextPath }: RegisterScreenProps) {
  const router = useRouter();
  const syncAuthSession = useAppStore((state) => state.commands.syncAuthSession);
  const [stage, setStage] = useState<RegistrationStage>('details');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [verificationDigits, setVerificationDigits] = useState<string[]>(createEmptyOtpDigits);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [agreementOpen, setAgreementOpen] = useState(false);
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
    if (valid) setStage('agreement');
  };

  const createAccount = async () => {
    setAgreementOpen(false);
    setFeedback(null);
    setWorking(true);

    const values = getValues();
    const email = values.email.trim().toLowerCase();
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: values.password,
      options: {
        data: {
          full_name: values.displayName.trim(),
          phone: normalizePhone(values.phone),
          terms_accepted: true,
          privacy_acknowledged: true,
          terms_version: TERMS_VERSION,
          privacy_version: PRIVACY_VERSION,
        },
      },
    });
    setWorking(false);

    if (error) {
      setFeedback(
        error.status === 429
          ? 'A verification message was requested recently. Please wait before trying again.'
          : 'We could not create the account. Check your details and try again.',
      );
      return;
    }

    setPendingEmail(email);
    clearVerificationCode();
    setStage('verify');
    requestAnimationFrame(() => otpRefs.current[0]?.focus());
  };

  const verifyEmail = async () => {
    if (!pendingEmail) return;
    if (!/^\d{6}$/.test(verificationCode)) {
      setFeedback('Enter the complete 6-digit verification code.');
      clearVerificationCode(true);
      return;
    }

    setFeedback(null);
    setWorking(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: pendingEmail,
      token: verificationCode,
      type: 'email',
    });

    if (error) {
      setWorking(false);
      setFeedback(
        error.status === 429
          ? 'Too many verification attempts. Please wait and try again.'
          : 'That verification code is invalid or has expired.',
      );
      clearVerificationCode(true);
      return;
    }

    const current = await loadCurrentAppSession(supabase);
    setWorking(false);
    if (!current.session) {
      setFeedback('Your email was verified, but the account profile could not be loaded. Please sign in again.');
      return;
    }

    syncAuthSession({ session: current.session, phone: current.profile?.phone });
    router.replace(resolveSafeNextPath(nextPath, '/customer/account'));
    router.refresh();
  };

  const resendCode = async () => {
    if (!pendingEmail) return;
    setFeedback(null);
    setWorking(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email: pendingEmail });
    setWorking(false);

    if (error) {
      setFeedback(
        error.status === 429
          ? 'Please wait before requesting another verification code.'
          : 'We could not send another verification code. Please try again.',
      );
      return;
    }

    clearVerificationCode(true);
  };

  return (
    <AuthScaffold
      description="Create your customer account, review the terms and privacy policy, then verify your email."
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
          <StepText>Your email will be verified before you can use the account.</StepText>
          <Field
            autoComplete="name"
            error={Boolean(errors.displayName)}
            helperText={errors.displayName?.message}
            label="Full name"
            slotProps={{ htmlInput: { maxLength: 60 } }}
            {...register('displayName')}
          />
          <Field
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            label="Email address"
            slotProps={{ htmlInput: { autoCapitalize: 'none', maxLength: 254, spellCheck: false } }}
            type="email"
            {...register('email')}
          />
          <Field
            autoComplete="tel"
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
            label="Mobile number"
            inputMode="tel"
            slotProps={{ htmlInput: { maxLength: 15 } }}
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
          <StepText>Use at least 8 characters and avoid reusing a password from another account.</StepText>
          <Field
            autoComplete="new-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            label="Password"
            slotProps={{ htmlInput: { maxLength: 72 } }}
            type="password"
            {...register('password')}
          />
          <Field
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            label="Confirm password"
            slotProps={{ htmlInput: { maxLength: 72 } }}
            type="password"
            {...register('confirmPassword')}
          />
          <ActionRow>
            <SecondaryButton onClick={() => setStage('details')} type="button">Back</SecondaryButton>
            <PrimaryButton disabled={working} onClick={continueFromSecurity} type="button" variant="contained">
              Continue to review
            </PrimaryButton>
          </ActionRow>
        </Form>
      ) : null}


      {stage === 'agreement' ? (
        <Form aria-label="Review registration agreement" noValidate onSubmit={(event) => event.preventDefault()}>
          <StepTitle>Review before creating your account</StepTitle>
          <StepText>
            Your account is not created until you review both documents and explicitly record your agreement.
          </StepText>
          <LegalReviewList aria-label="Documents to review">
            <LegalReviewRow>
              <LegalReviewText>Terms of Use</LegalReviewText>
              <LegalVersion>Version {TERMS_VERSION}</LegalVersion>
            </LegalReviewRow>
            <LegalReviewRow>
              <LegalReviewText>Privacy Policy</LegalReviewText>
              <LegalVersion>Version {PRIVACY_VERSION}</LegalVersion>
            </LegalReviewRow>
          </LegalReviewList>
          <ActionRow>
            <SecondaryButton disabled={working} onClick={() => setStage('security')} type="button">Back</SecondaryButton>
            <PrimaryButton disabled={working} onClick={() => setAgreementOpen(true)} type="button" variant="contained">
              {working ? 'Creating account…' : 'Review terms & privacy'}
            </PrimaryButton>
          </ActionRow>
        </Form>
      ) : null}

      {stage === 'verify' && pendingEmail ? (
        <Form aria-label="Verify email address" noValidate onSubmit={(event) => event.preventDefault()}>
          <StepTitle>Check your email</StepTitle>
          <StepText>Enter the 6-digit verification code sent to {pendingEmail}.</StepText>
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
            <SecondaryButton disabled={working} onClick={resendCode} type="button">Send a new code</SecondaryButton>
          </InlineActions>
          <ActionRow>
            <span />
            <PrimaryButton disabled={working || verificationCode.length !== REGISTRATION_OTP_LENGTH} onClick={verifyEmail} type="button" variant="contained">
              {working ? 'Verifying…' : 'Verify email and continue'}
            </PrimaryButton>
          </ActionRow>
        </Form>
      ) : null}

      <RegistrationAgreementDialog
        onAccept={createAccount}
        onClose={() => setAgreementOpen(false)}
        open={agreementOpen}
        working={working}
      />

      <FooterText>
        Already have an account?{' '}
        <TextLink href={`/login?next=${encodeURIComponent(resolveSafeNextPath(nextPath, '/customer/account'))}`}>Sign in</TextLink>
      </FooterText>
    </AuthScaffold>
  );
}
