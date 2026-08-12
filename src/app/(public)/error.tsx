'use client';

import PublicRouteStateScreen from '@/screens/public/PublicRouteStateScreen';

interface PublicErrorProps {
  reset: () => void;
}

export default function PublicError({ reset }: PublicErrorProps) {
  return <PublicRouteStateScreen mode="error" onRetry={reset} />;
}
