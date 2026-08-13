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
          ? 'Your account access is being prepared.'
          : 'We could not prepare this authentication screen.'
      }
      title={loading ? 'Preparing account access' : 'This page did not load'}
    >
      <StateRegion>
        {loading ? (
          <LoadingState
            description="Please wait while the sign-in page loads."
            label="Loading authentication"
          />
        ) : (
          <ErrorState
            description="Try opening the page again. No credential or personal information was submitted."
            onRetry={onRetry}
            title="Authentication unavailable"
          />
        )}
      </StateRegion>
    </AuthScaffold>
  );
}
