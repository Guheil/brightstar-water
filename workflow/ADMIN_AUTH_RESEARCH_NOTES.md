# Admin Controls and Authentication Research Notes

Research date: 2026-08-16

This pass was based on 32 primary or authoritative sources. The security guidance below informs interaction design, authorization boundaries, session handling, and the trusted service contract.

## Implementation conclusions

- Use dialogs for small, focused forms and confirmations. Keep large multi-field product editing on a dedicated page.
- Put row-level actions behind a clearly labelled menu button to preserve table density and keyboard behavior.
- Give destructive actions explicit consequence copy and a safe Cancel action. Preserve referenced historical data instead of deleting it.
- Treat Products as CRUD-like, Inventory as adjustment/history-driven, Orders and Deliveries as workflow/state-driven, and Customers as managed records with history preservation.
- Keep login compatible with password managers, autofill, paste, and show/hide password controls.
- Use generic invalid-credential messaging. Do not expose whether a user exists through login feedback.
- Production authorization must be enforced server-side, deny by default, and verify permissions for every privileged operation.
- Validate and sanitize untrusted input at trusted server boundaries. Client validation improves usability but is not an authorization boundary.
- Future state-changing authenticated endpoints will need CSRF protection appropriate to the chosen session architecture, rate limiting, secure session handling, and audit logging.

## Material UI

1. Dialog: https://mui.com/material-ui/react-dialog/
   - Dialogs are interruptive and best reserved for decisions or focused tasks.
2. Menu: https://mui.com/material-ui/react-menu/
   - Action menus are appropriate for compact temporary sets of choices.
3. Table: https://mui.com/material-ui/react-table/
   - Tables support scanning and operational tools around structured data.
4. Text Field: https://mui.com/material-ui/react-text-field/
   - Text fields combine labels, input semantics, and helper/error text.
5. Button: https://mui.com/material-ui/react-button/
   - Visual emphasis should distinguish primary, secondary, and destructive actions.
6. Modal: https://mui.com/material-ui/react-modal/
   - MUI Modal supplies focus management and ARIA foundations; Dialog is preferred for modal dialogs.
7. Alert: https://mui.com/material-ui/react-alert/
   - Non-blocking feedback is appropriate for success, warning, and error states.
8. Snackbar: https://mui.com/material-ui/react-snackbar/
   - Temporary feedback can be surfaced without interrupting the primary task.

## W3C / WAI

9. Dialog modal pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
   - Focus stays inside the modal until it closes and the dialog needs an accessible name.
10. Menu button pattern: https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
    - Menu triggers need button semantics, `aria-haspopup`, expanded state, and keyboard support.
11. Button pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/
    - Actions should use button semantics rather than links disguised as actions.
12. WCAG 2.2: https://www.w3.org/TR/WCAG22/
    - Provides the accessibility baseline used across forms, authentication, focus, and target sizing.
13. Error identification: https://www.w3.org/WAI/WCAG22/Understanding/error-identification
    - Validation errors need text that identifies what is wrong.
14. Accessible authentication: https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html
    - Authentication should support password managers and paste rather than relying on memory/transcription.
15. Modal dialog example: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/
    - Shows focus placement, labels, descriptions, and close/cancel behavior.
16. Menu and menubar pattern: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
    - Defines keyboard interaction expectations for action menus and their items.

## OWASP

17. Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
    - Use generic auth errors, protect sensitive accounts, and plan throttling and monitoring for production.
18. Authorization Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
    - Authentication and authorization are separate; privileged actions need explicit authorization checks.
19. Session Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
    - Production sessions require unpredictable identifiers, secure cookies, lifecycle controls, and server-side trust.
20. Input Validation Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
    - Validate syntax and business semantics as early as possible on the trusted backend.
21. Cross-Site Scripting Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
    - Prefer safe rendering and context-aware output handling; do not trust stored user input.
22. CSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
    - Future cookie-authenticated state changes require CSRF defenses and origin-aware design.
23. Forgot Password Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
    - Recovery should avoid account enumeration, use expiring single-use tokens, and rate-limit requests.
24. Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
    - Administrative and security-relevant events need deliberate audit logging without exposing secrets.
25. Content Security Policy Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
    - CSP is a defense-in-depth layer against script injection and unsafe resource loading.
26. DOM XSS Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
    - Client-side DOM sinks must still treat data as untrusted even when the server is not involved.
27. Authorization Testing Automation Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html
    - Production permission matrices should be tested so later feature changes cannot silently bypass authorization.

## NIST, USWDS, and GOV.UK

28. NIST SP 800-63B: https://pages.nist.gov/800-63-4/sp800-63b.html
    - Permit password managers, autofill, paste, and optional password visibility; production verifiers need secure password storage and protected channels.
29. NIST authenticator requirements: https://pages.nist.gov/800-63-4/sp800-63b/authenticators/
    - Password/authenticator requirements should be based on current verifier guidance rather than arbitrary composition rules.
30. NIST Digital Identity FAQ: https://pages.nist.gov/800-63-FAQ/
    - Provides practical clarification around password managers and modern password policy.
31. USWDS Modal: https://designsystem.digital.gov/components/modal/
    - Use modals sparingly for simple tasks and avoid complex forms or large information sets inside them.
32. GOV.UK Password Input: https://design-system.service.gov.uk/components/password-input/
    - Hide passwords by default, provide a show/hide control, and use appropriate autocomplete semantics.

## Project-specific application

- Product deletion is guarded. Products referenced by orders, cart state, reserved inventory, or inventory history must be deactivated instead of destroyed.
- Inventory records are not directly deleted. Admin records reasoned stock adjustments that preserve history.
- Customer records are not hard-deleted. Admin can update application contact details and activate/deactivate the account while preserving order/address/loyalty history.
- Orders and deliveries expose workflow actions rather than misleading CRUD deletion.
- Login fields start empty. Seeded workspace shortcuts populate the form without exposing a role selector.
- Deactivating a customer now prevents that workspace account from signing in.
