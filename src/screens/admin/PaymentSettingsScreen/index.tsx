'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { EmptyState, LoadingState, Notice } from '@/components';
import {
  fetchAdminGCashPaymentSettings,
  PaymentSettingsApiError,
  updateAdminGCashPaymentSettings,
} from '@/lib/payments/client';
import type { GCashPaymentSettingsView } from '@/lib/payments/types';
import AdminPageHeader from '../components/AdminPageHeader';
import {
  AvailabilityControl,
  AvailabilitySwitch,
  ButtonRow,
  Field,
  FormActions,
  FormSection,
  HiddenFileInput,
  QrArea,
  QrControls,
  QrEmpty,
  QrHelp,
  QrPreview,
  QrPreviewFrame,
  RemoveButton,
  Root,
  SaveButton,
  SectionCopy,
  SectionHeading,
  SectionTitle,
  SettingsForm,
  UploadButton,
} from './elements';
import type { PaymentSettingsFormState } from './interface';

const acceptedQrTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
const maxQrBytes = 3 * 1024 * 1024;

const emptyForm: PaymentSettingsFormState = {
  enabled: false,
  recipientName: '',
  accountNumber: '',
  removeQr: false,
};

function formFromSettings(settings: GCashPaymentSettingsView): PaymentSettingsFormState {
  return {
    enabled: settings.enabled,
    recipientName: settings.recipientName,
    accountNumber: settings.accountNumber,
    removeQr: false,
  };
}

export default function PaymentSettingsScreen() {
  const [settings, setSettings] = useState<GCashPaymentSettingsView | null>(null);
  const [form, setForm] = useState<PaymentSettingsFormState>(emptyForm);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchAdminGCashPaymentSettings(controller.signal)
      .then((result) => {
        setSettings(result);
        setForm(formFromSettings(result));
        setError(null);
      })
      .catch((loadError) => {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : 'GCash payment settings could not be loaded.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!qrFile) {
      setQrPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(qrFile);
    setQrPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [qrFile]);

  const visibleQrUrl = useMemo(() => {
    if (qrPreviewUrl) return qrPreviewUrl;
    if (form.removeQr) return '';
    return settings?.qrImageUrl ?? '';
  }, [form.removeQr, qrPreviewUrl, settings?.qrImageUrl]);

  const qrWillExist = Boolean(qrFile || (!form.removeQr && settings?.qrConfigured));

  const handleQrFile = (file?: File) => {
    setError(null);
    setSuccess(null);
    if (!file) return;
    if (!acceptedQrTypes.has(file.type)) {
      setError('Choose a PNG, JPG, or WebP QR image.');
      return;
    }
    if (file.size <= 0 || file.size > maxQrBytes) {
      setError('Choose a QR image smaller than 3 MB.');
      return;
    }
    setQrFile(file);
    setForm((current) => ({ ...current, removeQr: false }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings) return;

    const recipientName = form.recipientName.trim();
    const accountNumber = form.accountNumber.replace(/\D/g, '');
    if (accountNumber && !/^09\d{9}$/.test(accountNumber)) {
      setError('Enter an 11-digit GCash mobile number starting with 09.');
      return;
    }
    if (form.enabled && !recipientName) {
      setError('Add the GCash recipient name before enabling GCash.');
      return;
    }
    if (form.enabled && !accountNumber && !qrWillExist) {
      setError('Add a GCash number, QR code, or both before enabling GCash.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateAdminGCashPaymentSettings({
        enabled: form.enabled,
        recipientName,
        accountNumber,
        removeQr: form.removeQr,
        expectedVersion: settings.version,
      }, qrFile);
      setSettings(updated);
      setForm(formFromSettings(updated));
      setQrFile(null);
      setSuccess('GCash payment settings were updated.');
    } catch (saveError) {
      if (saveError instanceof PaymentSettingsApiError && saveError.status === 409) {
        setError('Payment settings changed in another session. Reload this page before saving again.');
      } else {
        setError(saveError instanceof Error ? saveError.message : 'GCash payment settings could not be saved.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Root>
        <AdminPageHeader
          description="Control which GCash destination customers see during checkout."
          title="Payment settings"
        />
        <LoadingState label="Loading payment settings" />
      </Root>
    );
  }

  if (!settings) {
    return (
      <Root>
        <AdminPageHeader
          description="Control which GCash destination customers see during checkout."
          title="Payment settings"
        />
        <EmptyState
          description={error ?? 'GCash payment settings could not be loaded.'}
          title="Payment settings unavailable"
        />
      </Root>
    );
  }

  return (
    <Root>
      <AdminPageHeader
        description="Change the GCash recipient, mobile number, QR code, and checkout availability without editing the website."
        title="Payment settings"
      />

      {error ? <Notice tone="error">{error}</Notice> : null}
      {success ? <Notice tone="success">{success}</Notice> : null}

      <SettingsForm onSubmit={submit}>
        <FormSection aria-labelledby="gcash-availability-title">
          <SectionHeading>
            <SectionTitle id="gcash-availability-title">GCash availability</SectionTitle>
            <SectionCopy>
              Customers only see GCash at checkout when this setting is enabled and a valid payment destination is saved.
            </SectionCopy>
          </SectionHeading>
          <AvailabilityControl
            control={(
              <AvailabilitySwitch
                checked={form.enabled}
                onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))}
              />
            )}
            label={form.enabled ? 'GCash is available at checkout' : 'GCash is unavailable at checkout'}
          />
        </FormSection>

        <FormSection aria-labelledby="gcash-recipient-title">
          <SectionHeading>
            <SectionTitle id="gcash-recipient-title">Recipient details</SectionTitle>
            <SectionCopy>
              Add the account name customers should verify before sending payment. A mobile number is optional when a QR code is provided.
            </SectionCopy>
          </SectionHeading>
          <Field
            autoComplete="off"
            label="Recipient name"
            slotProps={{ htmlInput: { maxLength: 100 } }}
            onChange={(event) => setForm((current) => ({ ...current, recipientName: event.target.value }))}
            value={form.recipientName}
          />
          <Field
            autoComplete="off"
            helperText="Optional when a QR code is saved. Use an 11-digit number starting with 09."
            label="GCash number"
            slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 20 } }}
            onChange={(event) => setForm((current) => ({ ...current, accountNumber: event.target.value }))}
            value={form.accountNumber}
          />
        </FormSection>

        <FormSection aria-labelledby="gcash-qr-title">
          <SectionHeading>
            <SectionTitle id="gcash-qr-title">Payment QR</SectionTitle>
            <SectionCopy>
              Upload a clear QR image if customers should be able to scan instead of typing the mobile number.
            </SectionCopy>
          </SectionHeading>
          <QrArea>
            <QrPreviewFrame>
              {visibleQrUrl ? (
                <QrPreview alt="Current GCash payment QR code" src={visibleQrUrl} />
              ) : qrWillExist ? (
                <QrEmpty>A QR code is saved, but its preview is temporarily unavailable.</QrEmpty>
              ) : (
                <QrEmpty>No QR code is currently saved.</QrEmpty>
              )}
            </QrPreviewFrame>
            <QrControls>
              <QrHelp>PNG, JPG, or WebP. Maximum upload size is 3 MB. The server validates and re-encodes the image before saving it.</QrHelp>
              <ButtonRow>
                <UploadButton component="label" variant="outlined">
                  {qrWillExist ? 'Replace QR' : 'Choose QR image'}
                  <HiddenFileInput
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => handleQrFile(event.target.files?.[0])}
                    type="file"
                  />
                </UploadButton>
                {qrWillExist ? (
                  <RemoveButton
                    onClick={() => {
                      setQrFile(null);
                      setForm((current) => ({ ...current, removeQr: true }));
                    }}
                    type="button"
                    variant="text"
                  >
                    Remove QR
                  </RemoveButton>
                ) : null}
              </ButtonRow>
            </QrControls>
          </QrArea>
        </FormSection>

        <FormActions>
          <SaveButton disabled={saving} type="submit" variant="contained">
            {saving ? 'Saving payment settings...' : 'Save payment settings'}
          </SaveButton>
        </FormActions>
      </SettingsForm>
    </Root>
  );
}
