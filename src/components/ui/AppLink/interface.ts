import type { ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';

export type AppLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'as'>;
