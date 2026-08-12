'use client';

import { LoadingState, PageContainer } from '@/components';

export default function CustomerOrderLoading() {
  return (
    <PageContainer>
      <LoadingState
        description="Reading the fictional order timeline and delivery state."
        label="Loading order details"
      />
    </PageContainer>
  );
}
