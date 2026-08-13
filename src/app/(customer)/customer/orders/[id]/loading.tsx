'use client';

import { LoadingState, PageContainer } from '@/components';

export default function CustomerOrderLoading() {
  return (
    <PageContainer>
      <LoadingState
        description="Reading the order timeline and delivery status."
        label="Loading order details"
      />
    </PageContainer>
  );
}
