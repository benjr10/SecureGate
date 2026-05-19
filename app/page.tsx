import Link from 'next/link';
import { NavPrefetcher } from '@/components/nav-prefetcher';

export default function LandingPage() {
  return (
    <>
      <NavPrefetcher />
      {/* Navigation Header */}
      <header className="app-header">
        <div className="container header-inner">
          <div className="brand-logo">
            <svg
              className="logo-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>SecureGate</span>
          </div>
          <Link href="/auth" className="btn btn-primary" prefetch={true}>
            Access Platform
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section container">
        <h1 className="display-large">Production-Grade Security Layer</h1>
        <p className="body-large hero-subtitle">
          An isolated authentication and access management layer built with defensive principles to safeguard user accounts, sessions, and routes.
        </p>
        <div className="hero-ctas">
          <Link href="/auth?tab=signup" className="btn btn-primary" prefetch={true}>
            Create Secure Account
          </Link>
          <Link href="/auth?tab=login" className="btn btn-secondary" prefetch={true}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="headline-large">Defensive Architecture Protocols</h2>
          <p className="body-medium" style={{ color: '#718096', marginTop: '8px' }}>
            Multi-tiered security controls operating at the client, API, and middleware boundaries.
          </p>

          <div className="features-grid">
            <div className="feature-card shadow-premium">
              <h3>NextAuth Session Security</h3>
              <p className="body-small" style={{ color: '#4a5568', marginTop: '8px' }}>
                Encrypted JWT session payloads persisted in HTTP-only, SameSite=Lax cookies to protect against session hijacking and scripting exploits.
              </p>
            </div>

            <div className="feature-card shadow-premium">
              <h3>Brute-Force Rate Limiting</h3>
              <p className="body-small" style={{ color: '#4a5568', marginTop: '8px' }}>
                Sliding-window IP and account throttling on sensitive endpoints to prevent credential stuffing and brute-force password guessing.
              </p>
            </div>

            <div className="feature-card shadow-premium">
              <h3>Strict Route Protection</h3>
              <p className="body-small" style={{ color: '#4a5568', marginTop: '8px' }}>
                Next.js Middleware boundary checking session state and verification status before rendering protected dashboard components.
              </p>
            </div>

            <div className="feature-card shadow-premium">
              <h3>Verification Token Lifecycle</h3>
              <p className="body-small" style={{ color: '#4a5568', marginTop: '8px' }}>
                Cryptographically secure, single-use, auto-expiring tokens for email onboarding confirmation and password recovery links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Lifecycle */}
      <section className="faq-section" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="headline-large">How Access Verification Works</h2>
          <div
            className="flex-center"
            style={{
              gap: '24px',
              marginTop: '40px',
              flexWrap: 'wrap',
              textAlign: 'left',
            }}
          >
            <div style={{ flex: '1 1 200px', maxWidth: '240px' }}>
              <div className="title-medium" style={{ color: 'var(--color-roles-primary-roles-primary-color-role)', marginBottom: '8px' }}>
                01. Sign Up
              </div>
              <p className="body-small" style={{ color: '#4a5568' }}>
                Submit credential details including name, email, and a secure password adhering to strength rules.
              </p>
            </div>

            <div style={{ flex: '1 1 200px', maxWidth: '240px' }}>
              <div className="title-medium" style={{ color: 'var(--color-roles-primary-roles-primary-color-role)', marginBottom: '8px' }}>
                02. Verify Email
              </div>
              <p className="body-small" style={{ color: '#4a5568' }}>
                An activation link is generated and sent via Resend. Confirm the link within 24 hours to activate account.
              </p>
            </div>

            <div style={{ flex: '1 1 200px', maxWidth: '240px' }}>
              <div className="title-medium" style={{ color: 'var(--color-roles-primary-roles-primary-color-role)', marginBottom: '8px' }}>
                03. Authenticate
              </div>
              <p className="body-small" style={{ color: '#4a5568' }}>
                Establish a session using credentials. Session handles tokens securely under strict cookies.
              </p>
            </div>

            <div style={{ flex: '1 1 200px', maxWidth: '240px' }}>
              <div className="title-medium" style={{ color: 'var(--color-roles-primary-roles-primary-color-role)', marginBottom: '8px' }}>
                04. Secure Access
              </div>
              <p className="body-small" style={{ color: '#4a5568' }}>
                Gain access to the protected `/dashboard` layout and view profile information safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section container">
        <h2 className="headline-large" style={{ textAlign: 'center' }}>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Is my authentication session secure?</h3>
            <p className="body-medium">
              Yes. All sessions are signed and encrypted via NextAuth.js JWT strategy. They are transmitted solely via HTTP-only cookies that cannot be accessed by client-side scripts.
            </p>
          </div>

          <div className="faq-item">
            <h3>How are passwords protected?</h3>
            <p className="body-medium">
              Passwords are never saved in plain text. They are hashed before insertion into the database using bcryptjs with 12 salt rounds, ensuring protection even against offline attacks.
            </p>
          </div>

          <div className="faq-item">
            <h3>Why must I verify my email before access?</h3>
            <p className="body-medium">
              Requiring verified emails prevents account creation spam, ensures that recovery links are deliverable, and validates identity before displaying any sensitive dashboard metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} SecureGate. Built with security-first identity patterns.</p>
        </div>
      </footer>
    </>
  );
}
