'use client';

import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import AuthScaffold from '../AuthScaffold';
import type { AuthRouteStateScreenProps } from './interface';
import { StateRegion } from './elements';

export default function AuthRouteStateScreen({
  mode,
  onRetry,
}: AuthRouteStateScreenProps) {
  const loading = mode === 'loading';

  return (
    <AuthScaffold
      description={
        loading
          ? 'The frontend is preparing the fictional presentation accounts.'
          : 'The prototype could not prepare this authentication screen.'
      }
      title={loading ? 'Preparing demo access' : 'This page did not load'}
    >
      <StateRegion>
        {loading ? (
          <LoadingState
            description="No production identity service is being contacted."
            label="Loading authentication demo"
          />
        ) : (
          <ErrorState
            description="Try opening the page again. No credential or personal information was submitted."
            onRetry={onRetry}
            title="Authentication demo unavailable"
          />
        )}
      </StateRegion>
    </AuthScaffold>
  );
}
