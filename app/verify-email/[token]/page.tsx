'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent double requests in React 18 Strict Mode
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    async function verifyToken() {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Verification failed.');
          setLoading(false);
        } else {
          // Success redirect to auth with verify success banner
          router.push('/auth?verified=true');
        }
      } catch (err) {
        setError('Something went wrong. Please try again later.');
        setLoading(false);
      }
    }

    if (token) {
      verifyToken();
    } else {
      setError('Invalid verification link.');
      setLoading(false);
    }
  }, [token, router]);

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card shadow-premium glass-panel" style={{ maxWidth: '480px', textAlign: 'center' }}>
        {loading ? (
          <div>
            <div className="flex-center" style={{ marginBottom: '20px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(3, 124, 230, 0.1)',
                  borderTopColor: 'var(--color-roles-primary-roles-primary-color-role)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            </div>
            <h2>Verifying Account</h2>
            <p style={{ color: '#718096', marginTop: '0.625rem' }}>Checking security signature and token expiration status...</p>
            <style jsx global>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <div>
            <div className="flex-center" style={{ marginBottom: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-roles-error-roles-error-container-color-role-3)',
                  color: 'var(--color-roles-error-roles-on-error-container-color-role-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  style={{ width: '28px', height: '28px' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <h2>Verification Failed</h2>
            <p className="body-medium" style={{ color: '#718096', marginTop: '8px', marginBottom: '24px' }}>
              {error}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/verify-prompt" className="btn btn-primary">
                Resend Verification Link
              </Link>
              <Link href="/auth?tab=login" className="btn btn-secondary">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
