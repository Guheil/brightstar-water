'use client';

import { ErrorState, PageContainer } from '@/components';

export default function CustomerError({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageContainer>
      <ErrorState
        description="We could not display this customer page. Try again to reload your account information."
        onRetry={reset}
        title="Customer page unavailable"
      />
    </PageContainer>
  );
}
