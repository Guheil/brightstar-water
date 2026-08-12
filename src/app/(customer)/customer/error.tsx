'use client';

import { ErrorState, PageContainer } from '@/components';

export default function CustomerError({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageContainer>
      <ErrorState
        description="We could not display this demo customer page. Your prototype data has not been sent anywhere."
        onRetry={reset}
        title="Customer page unavailable"
      />
    </PageContainer>
  );
}

