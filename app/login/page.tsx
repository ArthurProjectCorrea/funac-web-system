'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { MfaForm } from '@/components/auth/mfa-form';

type AuthStep = 'login' | 'mfa';

export default function LoginPage() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [mfaSessionId, setMfaSessionId] = useState<string>('');
  const router = useRouter();

  const handleMfaRequired = (sessionId: string) => {
    setMfaSessionId(sessionId);
    setCurrentStep('mfa');
  };

  const handleLoginSuccess = () => {
    const returnUrl = new URLSearchParams(window.location.search).get(
      'returnUrl'
    );
    router.push(returnUrl || '/dashboard');
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setMfaSessionId('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {currentStep === 'login' && (
          <LoginForm
            onMfaRequired={handleMfaRequired}
            onSuccess={handleLoginSuccess}
          />
        )}

        {currentStep === 'mfa' && (
          <MfaForm
            sessionId={mfaSessionId}
            onBack={handleBackToLogin}
            onSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </div>
  );
}
