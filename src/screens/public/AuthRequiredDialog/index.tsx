import {
  Actions,
  AuthDialog,
  Content,
  Note,
  PrimaryLink,
  SecondaryLink,
  Title,
} from './elements';
import type { AuthRequiredDialogProps } from './interface';

const createAuthHref = (base: '/login' | '/register', nextPath: string) =>
  `${base}?next=${encodeURIComponent(nextPath.startsWith('/') ? nextPath : '/')}`;

const CONTENT = {
  order: {
    title: 'Sign in before starting your order',
    description:
      'Your account keeps your cart, delivery details, and order updates together.',
    note: 'You can sign in to an existing account or create a new customer account.',
  },
  protected: {
    title: 'Sign in to continue',
    description:
      'This area is connected to your customer account, including orders, saved delivery locations, and loyalty activity.',
    note: 'Sign in to continue, or create an account if this is your first time ordering with MRJE Gas and Bright Star Water.',
  },
} as const;

export default function AuthRequiredDialog({
  nextPath,
  onClose,
  open,
  purpose = 'order',
}: AuthRequiredDialogProps) {
  const content = CONTENT[purpose];

  return (
    <AuthDialog
      aria-describedby="customer-auth-description"
      aria-labelledby="customer-auth-title"
      onClose={onClose}
      open={open}
    >
      <Title id="customer-auth-title">{content.title}</Title>
      <Content id="customer-auth-description">
        {content.description}
        <Note>{content.note}</Note>
      </Content>
      <Actions>
        <PrimaryLink href={createAuthHref('/login', nextPath)}>Sign in</PrimaryLink>
        <SecondaryLink href={createAuthHref('/register', nextPath)}>Create account</SecondaryLink>
      </Actions>
    </AuthDialog>
  );
}
