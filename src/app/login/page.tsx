'use client';

import LoginPage from '@/components/auth/login-page';

interface LoginProps {
  isTesting?: boolean;
}

export default function Login({ isTesting = false }: LoginProps = {}) {
  return (
    <div data-testid="login-page">
      <LoginPage />
    </div>
  );
}