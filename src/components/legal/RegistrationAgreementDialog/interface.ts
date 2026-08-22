export type LegalDocumentId = 'terms' | 'privacy';

export interface LegalSection {
  heading: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
}

export interface LegalDocumentDefinition {
  id: LegalDocumentId;
  title: string;
  version: string;
  effectiveDate: string;
  sections: readonly LegalSection[];
}

export interface RegistrationAgreementDialogProps {
  acceptLabel?: string;
  description?: string;
  onAccept: () => void | Promise<void>;
  onClose: () => void;
  open: boolean;
  title?: string;
  working?: boolean;
  workingLabel?: string;
}

export interface DocumentNavButtonProps {
  $active: boolean;
  $complete: boolean;
}
