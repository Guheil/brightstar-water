'use client';

import { useState, type UIEvent } from 'react';
import { getRegistrationLegalDocument } from './content';
import {
  AcceptButton,
  AgreementActions,
  AgreementContent,
  AgreementDialog,
  AgreementTitle,
  CancelButton,
  ConsentCheckbox,
  ConsentControl,
  ConsentGroup,
  ConsentHint,
  ConsentItem,
  DocumentEnd,
  DocumentHeader,
  DocumentNav,
  DocumentNavButton,
  DocumentTitle,
  DocumentViewport,
  IntroText,
  LegalList,
  LegalParagraph,
  LegalSectionBlock,
  LegalSectionTitle,
  NavCompletion,
  ReadInstruction,
  TitleText,
  VersionText,
} from './elements';
import type { LegalDocumentId, RegistrationAgreementDialogProps } from './interface';

const READING_END_TOLERANCE_PX = 4;

export default function RegistrationAgreementDialog({
  acceptLabel = 'Agree and create account',
  description = 'Please review the Terms of Use and Privacy Policy before creating your account. Each checkbox becomes available after you reach the end of its document.',
  onAccept,
  onClose,
  open,
  title = 'Review before creating your account',
  working = false,
  workingLabel = 'Creating account…',
}: RegistrationAgreementDialogProps) {
  const [activeDocument, setActiveDocument] = useState<LegalDocumentId>('terms');
  const [termsRead, setTermsRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  const activeDefinition = getRegistrationLegalDocument(activeDocument);
  const allDocumentsRead = termsRead && privacyRead;
  const canAccept = allDocumentsRead && termsAccepted && privacyAcknowledged && !working;

  const activeDocumentRead = activeDocument === 'terms' ? termsRead : privacyRead;
  const activeDocumentName = activeDocument === 'terms' ? 'Terms of Use' : 'Privacy Policy';

  const handleDocumentScroll = (event: UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const reachedEnd = element.scrollTop + element.clientHeight >= element.scrollHeight - READING_END_TOLERANCE_PX;
    if (!reachedEnd) return;

    if (activeDocument === 'terms') setTermsRead(true);
    if (activeDocument === 'privacy') setPrivacyRead(true);
  };

  const handleClose = () => {
    if (!working) onClose();
  };

  const handleDialogClose = () => {
    if (!working) onClose();
  };

  return (
    <AgreementDialog
      aria-describedby="registration-agreement-description"
      aria-labelledby="registration-agreement-title"
      onClose={handleDialogClose}
      open={open}
    >
      <AgreementTitle id="registration-agreement-title">
        <TitleText>{title}</TitleText>
        <IntroText id="registration-agreement-description">
          {description}
        </IntroText>
      </AgreementTitle>

      <AgreementContent>
        <DocumentNav aria-label="Registration legal documents" role="navigation">
          <DocumentNavButton
            $active={activeDocument === 'terms'}
            $complete={termsRead}
            aria-pressed={activeDocument === 'terms'}
            onClick={() => setActiveDocument('terms')}
            type="button"
          >
            <span>Terms of Use</span>
            {termsRead ? <NavCompletion>Reviewed</NavCompletion> : null}
          </DocumentNavButton>
          <DocumentNavButton
            $active={activeDocument === 'privacy'}
            $complete={privacyRead}
            aria-pressed={activeDocument === 'privacy'}
            onClick={() => setActiveDocument('privacy')}
            type="button"
          >
            <span>Privacy Policy</span>
            {privacyRead ? <NavCompletion>Reviewed</NavCompletion> : null}
          </DocumentNavButton>
        </DocumentNav>

        <DocumentHeader>
          <DocumentTitle id={`registration-${activeDefinition.id}-title`}>
            {activeDefinition.title}
          </DocumentTitle>
          <VersionText>
            Version {activeDefinition.version}, effective {activeDefinition.effectiveDate}
          </VersionText>
        </DocumentHeader>

        <DocumentViewport
          aria-labelledby={`registration-${activeDefinition.id}-title`}
          key={activeDefinition.id}
          onScroll={handleDocumentScroll}
          role="region"
          tabIndex={0}
        >
          {activeDefinition.sections.map((section) => (
            <LegalSectionBlock key={section.heading}>
              <LegalSectionTitle>{section.heading}</LegalSectionTitle>
              {section.paragraphs?.map((paragraph) => (
                <LegalParagraph key={paragraph}>{paragraph}</LegalParagraph>
              ))}
              {section.bullets ? (
                <LegalList>
                  {section.bullets.map((item) => <li key={item}>{item}</li>)}
                </LegalList>
              ) : null}
            </LegalSectionBlock>
          ))}
          <DocumentEnd>End of {activeDefinition.title}</DocumentEnd>
        </DocumentViewport>

        <ReadInstruction aria-live="polite">
          {allDocumentsRead
            ? 'You have reached the end of both documents. Confirm both choices below to continue creating your account.'
            : activeDocumentRead
              ? `You have reached the end of the ${activeDocumentName}. You can now confirm it below.`
              : `Please read to the end of the ${activeDocumentName}. Once you reach the end, you can confirm it below.`}
        </ReadInstruction>

        <ConsentGroup aria-label="Registration agreement">
          <ConsentItem>
            <ConsentControl
              control={(
                <ConsentCheckbox
                  checked={termsAccepted}
                  disabled={!termsRead || working}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                />
              )}
              disabled={!termsRead || working}
              label="I agree to the Terms of Use."
            />
            <ConsentHint>
              {termsRead
                ? 'You can now confirm your agreement to the Terms of Use.'
                : 'Read the Terms of Use to the end before checking this box.'}
            </ConsentHint>
          </ConsentItem>

          <ConsentItem>
            <ConsentControl
              control={(
                <ConsentCheckbox
                  checked={privacyAcknowledged}
                  disabled={!privacyRead || working}
                  onChange={(event) => setPrivacyAcknowledged(event.target.checked)}
                />
              )}
              disabled={!privacyRead || working}
              label="I acknowledge that I have read the Privacy Policy."
            />
            <ConsentHint>
              {privacyRead
                ? 'You can now confirm that you have read the Privacy Policy.'
                : 'Read the Privacy Policy to the end before checking this box.'}
            </ConsentHint>
          </ConsentItem>
        </ConsentGroup>
      </AgreementContent>

      <AgreementActions>
        <CancelButton disabled={working} onClick={handleClose} type="button">Cancel</CancelButton>
        <AcceptButton disabled={!canAccept} onClick={onAccept} type="button" variant="contained">
          {working ? workingLabel : acceptLabel}
        </AcceptButton>
      </AgreementActions>
    </AgreementDialog>
  );
}
