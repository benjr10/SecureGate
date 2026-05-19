'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyPromptForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
    
    const errorParam = searchParams.get('error');
    if (errorParam === 'expired') {
      setError('Your verification link has expired. Please request a new one.');
    }
  }, [searchParams]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Email address is required to resend link.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend verification email.');
      } else {
        setSuccess('A new verification link has been sent to your email.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card shadow-premium glass-panel" style={{ maxWidth: '480px' }}>
        <div className="auth-card-header">
          <div className="flex-center" style={{ marginBottom: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-roles-primary-roles-primary-container-color-role)',
                color: 'var(--color-roles-primary-roles-primary-color-role)',
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
                  d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5"
                />
              </svg>
            </div>
          </div>
          <h2>Verify Your Email</h2>
          <p style={{ fontSize: '14px', lineHeight: '20px', marginTop: '12px' }}>
            We've sent a verification link to your email address. You must verify your account to unlock dashboard access.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleResend} style={{ marginTop: '24px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="resend-email">Confirm Email Address</label>
            <input
              id="resend-email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Sending link...' : 'Resend Verification Email'}
          </button>
        </form>

        <div className="auth-footer-links">
          <Link href="/auth?tab=login" style={{ fontSize: '13px' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPromptPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPromptForm />
    </Suspense>
  );
}
