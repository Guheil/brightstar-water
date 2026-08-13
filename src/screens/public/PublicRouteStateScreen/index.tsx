'use client';

import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import type { PublicRouteStateScreenProps } from './interface';
import { Root } from './elements';

export default function PublicRouteStateScreen({
  mode,
  onRetry,
}: PublicRouteStateScreenProps) {
  return (
    <Root>
      {mode === 'loading' ? (
        <LoadingState
          description="Preparing the catalog and delivery information."
          label="Loading page"
        />
      ) : (
        <ErrorState
          description="We could not open this page. Try again, or return to the shop from the main navigation."
          onRetry={onRetry}
          title="This page did not load"
        />
      )}
    </Root>
  );
}
