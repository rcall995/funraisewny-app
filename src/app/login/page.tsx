import { Suspense } from 'react';
import LoginForm from './LoginForm';

function LoginPageContent() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <LoginForm />
        </div>
    )
}

export default function LoginPage() {
  return (
    // You must wrap the component that uses useSearchParams in a Suspense boundary
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}