'use client';

import AuthRouteStateScreen from '@/screens/auth/AuthRouteStateScreen';

interface AuthErrorProps {
  reset: () => void;
}

export default function AuthError({ reset }: AuthErrorProps) {
  return <AuthRouteStateScreen mode="error" onRetry={reset} />;
}
