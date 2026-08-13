'use client';

import { LoadingState, PageContainer } from '@/components';

export default function CustomerLoading() {
  return (
    <PageContainer>
      <LoadingState
        description="Preparing your account and order information."
        label="Loading customer workspace"
      />
    </PageContainer>
  );
}
