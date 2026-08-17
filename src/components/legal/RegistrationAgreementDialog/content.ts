import { LEGAL_EFFECTIVE_DATE, PRIVACY_VERSION, TERMS_VERSION } from '@/config';
import type { LegalDocumentDefinition } from './interface';

export const registrationLegalDocuments: readonly LegalDocumentDefinition[] = [
  {
    id: 'terms',
    title: 'Terms of Use',
    version: TERMS_VERSION,
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        heading: '1. About these terms',
        paragraphs: [
          'These Terms of Use govern your customer account and use of the MRJE Gas and Bright Star Water ordering and delivery system. The two storefronts may present different products, but they use one shared customer account and ordering platform.',
          'By creating an account, you confirm that you have reviewed these terms and agree to follow them when using the service.',
        ],
      },
      {
        heading: '2. Your account',
        bullets: [
          'Provide accurate and current registration information.',
          'Keep your password and verification codes private.',
          'Use your own account and do not impersonate another person.',
          'Tell the business if you believe your account has been accessed without permission.',
        ],
      },
      {
        heading: '3. Orders and product information',
        paragraphs: [
          'Product availability, pricing, delivery eligibility, and other order details are shown in the application at the time you place an order. An order may still require operational review before it is prepared or assigned for delivery.',
          'You are responsible for reviewing the items, quantities, delivery information, and payment method before submitting an order.',
        ],
      },
      {
        heading: '4. Delivery',
        paragraphs: [
          'Delivery availability depends on the address and service area shown by the application. You must provide a reachable mobile number and accurate delivery information so the assigned deliverer can complete the order safely and efficiently.',
          'If delivery cannot be completed because the customer is unavailable, the address is incorrect, payment cannot be completed, or another operational problem occurs, the order may be marked as a failed delivery and handled according to the policy shown in the application.',
        ],
      },
      {
        heading: '5. Payments, cancellations, and refunds',
        paragraphs: [
          'Available payment methods and any payment-verification requirements are displayed during checkout. Do not submit false, altered, or misleading payment information.',
          'Cancellation and refund eligibility depend on the current order state and the policy displayed in the application. Requests may require review before they are approved.',
        ],
      },
      {
        heading: '6. Acceptable use',
        bullets: [
          'Do not attempt to bypass authentication, access another customer account, or interfere with the service.',
          'Do not submit malicious code, automated abuse, false payment evidence, or intentionally misleading information.',
          'Do not use the service in a way that disrupts normal business operations or violates applicable law.',
        ],
      },
      {
        heading: '7. Service availability and account action',
        paragraphs: [
          'The application may occasionally be unavailable for maintenance, technical issues, or operational reasons. Features may also change as the system is improved.',
          'Access may be limited or suspended when necessary to protect customers, the businesses, or the system from misuse, fraud, or security threats.',
        ],
      },
      {
        heading: '8. Changes to these terms',
        paragraphs: [
          'If these terms materially change, a new version may be presented for review. The system can record which version was accepted so later changes do not overwrite the record of your earlier agreement.',
        ],
      },
      {
        heading: '9. Questions',
        paragraphs: [
          'For questions about an order or these terms, contact MRJE Gas or Bright Star Water using the official contact details provided through the application or the businesses\' official communication channels.',
        ],
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    version: PRIVACY_VERSION,
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    sections: [
      {
        heading: '1. What this policy covers',
        paragraphs: [
          'This Privacy Policy explains how personal information is handled when you create and use a customer account in the MRJE Gas and Bright Star Water ordering and delivery system.',
          'The system is designed to collect only information reasonably needed for account access, ordering, delivery, payment handling, customer support, security, and related business operations.',
        ],
      },
      {
        heading: '2. Information we collect',
        bullets: [
          'Account information such as your full name, email address, mobile number, account identifier, and account status.',
          'Authentication information handled by Supabase Auth, including verification and session information. Your password is handled by the authentication service and is not stored as plain text in the application database.',
          'Order and delivery information such as selected products, quantities, delivery address, delivery instructions, order history, and delivery status when you use those features.',
          'Payment-related records needed for the selected payment method, including payment status and any proof you intentionally submit when that feature is used.',
          'Operational and security records needed to investigate errors, abuse, unauthorized access, or important account activity.',
        ],
      },
      {
        heading: '3. Why we use your information',
        bullets: [
          'Create, verify, and maintain your customer account.',
          'Process orders and coordinate delivery.',
          'Communicate important account, order, and verification information.',
          'Handle payment verification, cancellations, refunds, and loyalty activity when those features apply.',
          'Protect accounts, investigate misuse, maintain system integrity, and support legitimate business records.',
          'Improve the reliability and usability of the service using information that is appropriate for that purpose.',
        ],
      },
      {
        heading: '4. Service providers',
        paragraphs: [
          'The application uses Supabase for authentication and database services. Verification messages may also pass through the email delivery provider configured for the Supabase project. These providers process information only as needed to provide their technical services.',
          'Personal information is not sold to advertisers by this application.',
        ],
      },
      {
        heading: '5. Who may access information',
        paragraphs: [
          'Access is limited according to the user\'s role and operational need. Customers should only access their own customer information. Administrators may access information needed to operate the service. Deliverers should receive only the customer and delivery details needed to complete assigned deliveries.',
          'Information may also be disclosed when reasonably required by applicable law, a valid legal process, or to protect the security and rights of customers or the businesses.',
        ],
      },
      {
        heading: '6. Security',
        paragraphs: [
          'The system uses authenticated sessions, database access controls, Row Level Security, input validation, and other technical safeguards appropriate to the application. No online system can guarantee absolute security, so account holders should also protect their passwords and verification codes.',
        ],
      },
      {
        heading: '7. Retention',
        paragraphs: [
          'Personal information is retained only for as long as it is reasonably needed for the account, order and delivery operations, security, legitimate record keeping, or applicable legal obligations. Information that is no longer needed should be deleted or anonymized when appropriate.',
        ],
      },
      {
        heading: '8. Your privacy rights',
        paragraphs: [
          'Subject to applicable Philippine data protection law and any lawful limitations, you may request access to your personal information, ask for inaccurate information to be corrected, object to certain processing, request deletion or blocking where appropriate, and exercise other rights available under the Data Privacy Act of 2012.',
          'You may also raise a privacy concern or complaint using the official contact details provided by MRJE Gas or Bright Star Water. You may contact the National Privacy Commission where applicable.',
        ],
      },
      {
        heading: '9. Sessions and necessary technical data',
        paragraphs: [
          'The application uses authentication cookies and related session information that are necessary to keep you signed in securely. These are part of the account service and are not used as advertising trackers by this application.',
        ],
      },
      {
        heading: '10. Changes to this policy',
        paragraphs: [
          'If this Privacy Policy materially changes, the application may present the updated version for review. The system records the policy version associated with registration so the historical acknowledgment is not silently replaced.',
        ],
      },
    ],
  },
] as const;

export const getRegistrationLegalDocument = (id: 'terms' | 'privacy') =>
  registrationLegalDocuments.find((document) => document.id === id) ?? registrationLegalDocuments[0];
