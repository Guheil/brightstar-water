'use client';

import { LoadingState, PageContainer } from '@/components';

export default function CustomerLoading() {
  return (
    <PageContainer>
      <LoadingState
        description="Preparing fictional account and order information."
        label="Loading customer workspace"
      />
    </PageContainer>
  );
}
