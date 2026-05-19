'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PasswordStrengthIndicator } from '@/components/password-strength';
import { usePasswordStrength } from '@/lib/use-password-strength';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Unified State for Login and Signup
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);

  // Initialize active tab from query parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup') {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }
    
    // Check if redirect query holds message or verification notifications
    const errorParam = searchParams.get('error');
    if (errorParam === 'CredentialsSignin') {
      setError('Invalid email or password.');
    } else if (errorParam) {
      setError('Authentication failed. Please try again.');
    }

    const verifiedParam = searchParams.get('verified');
    if (verifiedParam === 'true') {
      setSuccess('Your email has been verified. You can now log in.');
    }
  }, [searchParams]);

  // Reset notifications on tab switch
  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
    setPassword('');
  };

  // Password Strength Calculation
  const { criteriaMetCount } = usePasswordStrength(password);

  // Submit Handler for Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccess(null);

    // Client-side validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      // Authenticate via NextAuth
      const res = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        // Keep login error message generic for security
        if (res.error.includes('Too many attempts')) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError('Invalid email or password.');
        }
      } else {
        // Next.js middleware will handle redirection bounds (e.g. unverified status)
        router.refresh();
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler for Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccess(null);

    // Client-side validations
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Enforce strength requirements client-side
    if (criteriaMetCount < 5) {
      setError('Password does not meet all security requirements.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed.');
      } else {
        // Success redirect to unverified landing prompt
        router.push(`/verify-prompt?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card shadow-premium glass-panel">
        
        {/* Brand Link */}
        <div className="auth-card-header">
          <Link href="/" className="brand-logo flex-center" style={{ textDecoration: 'none' }}>
            <svg
              className="logo-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '28px', height: '28px' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span style={{ fontSize: '1.25rem' }}>SecureGate</span>
          </Link>
          <h2>{activeTab === 'login' ? 'Welcome back' : 'Create an account'}</h2>
          <p>{activeTab === 'login' ? 'Sign in to access your secure dashboard' : 'Start with a production-grade secure identity'}</p>
        </div>

        {/* Tab Controls */}
        <div className="auth-tabs">
          <div
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            Login
          </div>
          <div
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => handleTabChange('signup')}
          >
            Signup
          </div>
        </div>

        {/* Success or Error Alerts */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Login Card Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: '0.75rem' }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="password-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Signup Card Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                className="form-control"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                type="email"
                className="form-control"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Choose Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <PasswordStrengthIndicator password={password} />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading || criteriaMetCount < 5}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}
