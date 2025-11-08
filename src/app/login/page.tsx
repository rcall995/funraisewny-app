// src/app/login/page.tsx

import { Suspense } from 'react';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}