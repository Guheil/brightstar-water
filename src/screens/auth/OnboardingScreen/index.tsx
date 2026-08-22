'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import RegistrationAgreementDialog from '@/components/legal/RegistrationAgreementDialog';
import Notice from '@/components/ui/Notice';
import { PRIVACY_VERSION, STOREFRONT_MEDIA, TERMS_VERSION } from '@/config';
import { loadCurrentAppSession, signOutCurrentUser } from '@/lib/auth/client';
import {
  onboardingPasswordSchema,
  onboardingProfileSchema,
} from '@/lib/auth/onboardingValidation';
import { ROLE_DESTINATIONS } from '@/lib/auth/session';
import type { OnboardingStage } from '@/lib/auth/types';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/store';
import type {
  OnboardingScreenProps,
  PasswordFormValues,
  ProfileFormValues,
} from './interface';
import {
  AccountSummary,
  Actions,
  BrandHeader,
  BrandLogos,
  Field,
  Form,
  FormDescription,
  FormPane,
  FormRegion,
  FormTitle,
  HeaderAccount,
  HeaderAccountLabel,
  HeaderAccountValue,
  JourneyIntro,
  JourneyPane,
  JourneyText,
  JourneyTitle,
  LogoFrame,
  LogoImage,
  PageShell,
  PasswordAdornment,
  PasswordToggle,
  PhotoCaption,
  PhotoCaptionText,
  PhotoCaptionTitle,
  PhotoCell,
  PhotoImage,
  PhotoStage,
  PrimaryButton,
  Root,
  SetupWorkspace,
  SignOutButton,
  StageList,
  StageName,
  StageRow,
  StageState,
  SummaryItem,
  SummaryLabel,
  SummaryValue,
  WelcomeBand,
  WelcomeCopy,
  WelcomeHint,
  WelcomeText,
  WelcomeTitle,
} from './elements';

interface ApiIssue {
  field: string;
  message: string;
}

interface ApiResult {
  error?: string;
  issues?: ApiIssue[];
}

export default function OnboardingScreen({ profile }: OnboardingScreenProps) {
  const router = useRouter();
  const syncAuthSession = useAppStore((state) => state.commands.syncAuthSession);
  const clearAuthSession = useAppStore((state) => state.commands.signOut);
  const [stage, setStage] = useState<OnboardingStage>(profile.onboarding_stage);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [finishingProfile, setFinishingProfile] = useState(false);

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    resolver: zodResolver(onboardingPasswordSchema),
  });

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: profile.full_name,
      phone: profile.phone,
    },
    resolver: zodResolver(
      onboardingProfileSchema.pick({ fullName: true, phone: true }),
    ),
    mode: 'onTouched',
  });

  const signOut = async () => {
    await signOutCurrentUser();
    clearAuthSession();
    router.replace('/login');
    router.refresh();
  };

  const submitPassword = passwordForm.handleSubmit(async (values) => {
    setFeedback(null);
    const response = await fetch('/api/onboarding/password', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const result = (await response.json()) as ApiResult & { onboardingStage?: OnboardingStage };

    if (!response.ok || result.onboardingStage !== 'profile_required') {
      setFeedback(result.error ?? 'The password could not be updated.');
      result.issues?.forEach((issue) => {
        if (issue.field === 'currentPassword' || issue.field === 'newPassword' || issue.field === 'confirmPassword') {
          passwordForm.setError(issue.field, { message: issue.message });
        }
      });
      return;
    }

    passwordForm.reset();
    setStage('profile_required');
  });

  const completeProfile = async () => {
    const valid = await profileForm.trigger();
    if (!valid) return;

    const values = profileForm.getValues();
    if (profile.role === 'customer' && !/^09\d{9}$/.test(values.phone)) {
      profileForm.setError('phone', {
        message: 'Use a Philippine mobile number in 09XXXXXXXXX format.',
      });
      return;
    }

    if (profile.role === 'customer') {
      setAgreementOpen(true);
      return;
    }

    await submitProfile(values);
  };

  const submitProfile = async (
    values: ProfileFormValues,
    includeLegalAgreement = false,
  ) => {
    setFinishingProfile(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/onboarding/profile', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: values.fullName,
          phone: values.phone,
          ...(includeLegalAgreement
            ? { termsVersion: TERMS_VERSION, privacyVersion: PRIVACY_VERSION }
            : {}),
        }),
      });
      const result = (await response.json()) as ApiResult;

      if (!response.ok) {
        setFeedback(result.error ?? 'Your account details could not be saved.');
        result.issues?.forEach((issue) => {
          if (issue.field === 'fullName' || issue.field === 'phone') {
            profileForm.setError(issue.field, { message: issue.message });
          }
        });
        return;
      }

      const supabase = createClient();
      const current = await loadCurrentAppSession(supabase);
      if (!current.session || !current.profile) {
        setFeedback('Your setup was saved, but your session could not be refreshed. Sign in again to continue.');
        return;
      }

      syncAuthSession({ session: current.session, phone: current.profile.phone });
      setStage('complete');
      router.replace(ROLE_DESTINATIONS[current.session.user.role]);
      router.refresh();
    } catch {
      setFeedback('Your account setup could not be completed. Check your connection and try again.');
    } finally {
      setFinishingProfile(false);
    }
  };

  const passwordStage = stage === 'password_required';
  const profileStage = stage === 'profile_required';

  const roleLabel =
    profile.role === 'admin'
      ? 'Administrator'
      : profile.role === 'deliverer'
        ? 'Deliverer'
        : 'Customer';
  const firstName = profile.full_name.trim().split(/\s+/)[0] || 'there';

  return (
    <Root>
      <PageShell>
        <BrandHeader>
          <BrandLogos aria-label="MRJE Gas and Bright Star Water">
            <LogoFrame>
              <LogoImage
                alt="MRJE Gas"
                fill
                priority
                sizes="(max-width: 600px) 144px, 168px"
                src="/onboarding/mrje-gas-logo.png"
              />
            </LogoFrame>
            <LogoFrame>
              <LogoImage
                alt="Bright Star Water"
                fill
                priority
                sizes="(max-width: 600px) 144px, 168px"
                src="/onboarding/bright-star-water-logo.png"
              />
            </LogoFrame>
          </BrandLogos>

          <HeaderAccount>
            <HeaderAccountLabel>{roleLabel} account</HeaderAccountLabel>
            <HeaderAccountValue>{profile.email}</HeaderAccountValue>
          </HeaderAccount>
        </BrandHeader>

        <WelcomeBand>
          <WelcomeCopy>
            <WelcomeTitle>Welcome, {firstName}.</WelcomeTitle>
            <WelcomeText>
              Your administrator already started this account for you. Choose a password that belongs only to you, check the details we have, and you are ready to continue.
            </WelcomeText>
            <WelcomeHint>Two short setup steps. Your existing account access stays protected while you finish.</WelcomeHint>
          </WelcomeCopy>

          <PhotoStage aria-label="MRJE Gas and Bright Star Water delivery services">
            <PhotoCell>
              <PhotoImage
                alt={STOREFRONT_MEDIA.gas.delivery.alt}
                fill
                priority
                sizes="(max-width: 900px) 58vw, 38vw"
                src={STOREFRONT_MEDIA.gas.delivery.src}
              />
              <PhotoCaption>
                <PhotoCaptionTitle>MRJE Gas</PhotoCaptionTitle>
                <PhotoCaptionText>Reliable LPG ordering and local delivery.</PhotoCaptionText>
              </PhotoCaption>
            </PhotoCell>
            <PhotoCell>
              <PhotoImage
                alt={STOREFRONT_MEDIA.water.delivery.alt}
                fill
                priority
                sizes="(max-width: 900px) 42vw, 22vw"
                src={STOREFRONT_MEDIA.water.delivery.src}
              />
            </PhotoCell>
          </PhotoStage>
        </WelcomeBand>

        <SetupWorkspace>
          <JourneyPane>
            <JourneyIntro>
              <JourneyTitle>Finish your account setup</JourneyTitle>
              <JourneyText>
                We will keep you on this page until both required steps are complete.
              </JourneyText>
            </JourneyIntro>

            <StageList aria-label="Account setup progress">
              <StageRow $active={passwordStage} $complete={!passwordStage}>
                <StageName>Secure your account</StageName>
                <StageState>{passwordStage ? 'Current' : 'Complete'}</StageState>
              </StageRow>
              <StageRow $active={profileStage} $complete={stage === 'complete'}>
                <StageName>Complete your details</StageName>
                <StageState>
                  {profileStage ? 'Current' : stage === 'complete' ? 'Complete' : 'Next'}
                </StageState>
              </StageRow>
            </StageList>

            <AccountSummary>
              <SummaryItem>
                <SummaryLabel>Signed in as</SummaryLabel>
                <SummaryValue>{profile.email}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Account access</SummaryLabel>
                <SummaryValue>{roleLabel}</SummaryValue>
              </SummaryItem>
            </AccountSummary>
          </JourneyPane>

          <FormPane id="main-content" tabIndex={-1}>
            <FormRegion>
              {feedback ? <Notice title="Setup could not continue" tone="error">{feedback}</Notice> : null}

              {passwordStage ? (
                <>
                  <FormTitle>Create your private password</FormTitle>
                  <FormDescription>
                    Enter the temporary password provided by the administrator once more, then replace it with a password only you know.
                  </FormDescription>
                  <Form noValidate onSubmit={submitPassword}>
                    <Field
                      autoComplete="current-password"
                      error={Boolean(passwordForm.formState.errors.currentPassword)}
                      helperText={passwordForm.formState.errors.currentPassword?.message}
                      label="Temporary password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <PasswordAdornment position="end">
                              <PasswordToggle
                                aria-label={showCurrentPassword ? 'Hide temporary password' : 'Show temporary password'}
                                onClick={() => setShowCurrentPassword((current) => !current)}
                                type="button"
                              >
                                {showCurrentPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                              </PasswordToggle>
                            </PasswordAdornment>
                          ),
                        },
                      }}
                      {...passwordForm.register('currentPassword')}
                    />
                    <Field
                      autoComplete="new-password"
                      error={Boolean(passwordForm.formState.errors.newPassword)}
                      helperText={passwordForm.formState.errors.newPassword?.message ?? 'Use at least 8 characters and do not reuse the temporary password.'}
                      label="New password"
                      type={showNewPassword ? 'text' : 'password'}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <PasswordAdornment position="end">
                              <PasswordToggle
                                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                                onClick={() => setShowNewPassword((current) => !current)}
                                type="button"
                              >
                                {showNewPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                              </PasswordToggle>
                            </PasswordAdornment>
                          ),
                        },
                      }}
                      {...passwordForm.register('newPassword')}
                    />
                    <Field
                      autoComplete="new-password"
                      error={Boolean(passwordForm.formState.errors.confirmPassword)}
                      helperText={passwordForm.formState.errors.confirmPassword?.message}
                      label="Confirm new password"
                      type={showNewPassword ? 'text' : 'password'}
                      {...passwordForm.register('confirmPassword')}
                    />
                    <Actions>
                      <SignOutButton onClick={signOut} type="button">Sign out</SignOutButton>
                      <PrimaryButton
                        disabled={passwordForm.formState.isSubmitting}
                        type="submit"
                        variant="contained"
                      >
                        {passwordForm.formState.isSubmitting ? 'Updating password...' : 'Save password and continue'}
                      </PrimaryButton>
                    </Actions>
                  </Form>
                </>
              ) : null}

              {profileStage ? (
                <>
                  <FormTitle>Check your account details</FormTitle>
                  <FormDescription>
                    Review what the administrator entered and fill in anything that is still missing. Your email remains tied to this account.
                  </FormDescription>
                  <Form
                    noValidate
                    onSubmit={(event) => {
                      event.preventDefault();
                      void completeProfile();
                    }}
                  >
                    <Field disabled label="Email address" value={profile.email} />
                    <Field
                      autoComplete="name"
                      error={Boolean(profileForm.formState.errors.fullName)}
                      helperText={profileForm.formState.errors.fullName?.message}
                      label="Full name"
                      {...profileForm.register('fullName')}
                    />
                    <Field
                      autoComplete="tel"
                      error={Boolean(profileForm.formState.errors.phone)}
                      helperText={profileForm.formState.errors.phone?.message ?? (profile.role === 'customer' ? 'Required for delivery updates and order coordination.' : 'Optional. Add it if you want a contact number on this account.')}
                      label="Contact number"
                      slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 11 } }}
                      {...profileForm.register('phone', {
                        onChange: (event) => {
                          event.target.value = event.target.value.replace(/\D/g, '').slice(0, 11);
                        },
                      })}
                    />
                    <Actions>
                      <SignOutButton onClick={signOut} type="button">Sign out</SignOutButton>
                      <PrimaryButton
                        disabled={finishingProfile}
                        type="submit"
                        variant="contained"
                      >
                        {finishingProfile ? 'Finishing setup...' : profile.role === 'customer' ? 'Review and activate account' : 'Activate account'}
                      </PrimaryButton>
                    </Actions>
                  </Form>
                </>
              ) : null}
            </FormRegion>
          </FormPane>
        </SetupWorkspace>
      </PageShell>

      {profile.role === 'customer' ? (
        <RegistrationAgreementDialog
          acceptLabel="Agree and finish setup"
          description="Please review the Terms of Use and Privacy Policy before activating your Customer account. Each checkbox becomes available after you reach the end of its document."
          onAccept={async () => {
            setAgreementOpen(false);
            await submitProfile(profileForm.getValues(), true);
          }}
          onClose={() => setAgreementOpen(false)}
          open={agreementOpen}
          title="Review before activating your account"
          working={finishingProfile}
          workingLabel="Finishing setup..."
        />
      ) : null}
    </Root>
  );
}
