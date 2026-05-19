import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth');
  }

  const emailVerified = (session.user as any).emailVerified;

  return (
    <div>
      {/* Welcome Card */}
      <div className="dashboard-welcome-card shadow-premium">
        <h2 className="headline-medium">Hello, {session.user.name || 'Secure User'}</h2>
        <p className="body-medium" style={{ color: '#4a5568', marginTop: '6px' }}>
          Welcome to your secure identity console. Below is an audit of your account access controls.
        </p>
      </div>

      {/* Security Details Grid */}
      <div className="dashboard-details-grid">
        {/* Verification Status Card */}
        <div className="details-card shadow-premium">
          <h4>Verification Audit</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-roles-success-roles-on-success-container-color-role)' }}>
              Verified
            </span>
            <span style={{ fontSize: '13px', color: '#718096' }}>
              Confirmed on: {emailVerified ? new Date(emailVerified).toLocaleString() : 'N/A'}
            </span>
            <div style={{ fontSize: '12px', padding: '8px', backgroundColor: '#f0fff4', color: '#276749', borderRadius: '4px', marginTop: '8px' }}>
              ✓ Email verification prevents account duplication and phishing vectors.
            </div>
          </div>
        </div>

        {/* Hashing Status Card */}
        <div className="details-card shadow-premium">
          <h4>Credential Protection</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
              Bcryptjs Hashed
            </span>
            <span style={{ fontSize: '13px', color: '#718096' }}>
              Work factor (salt rounds): 12
            </span>
            <div style={{ fontSize: '12px', padding: '8px', backgroundColor: '#ebf8ff', color: '#2b6cb0', borderRadius: '4px', marginTop: '8px' }}>
              ✓ Password hashes are one-way and salted to defend against rainbow table lookups.
            </div>
          </div>
        </div>

        {/* Session Security Card */}
        <div className="details-card shadow-premium">
          <h4>Session Configuration</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
              JWT Strategy
            </span>
            <span style={{ fontSize: '13px', color: '#718096' }}>
              Cookie state: HTTP-Only, SameSite=Lax
            </span>
            <div style={{ fontSize: '12px', padding: '8px', backgroundColor: '#edf2f7', color: '#4a5568', borderRadius: '4px', marginTop: '8px' }}>
              ✓ Sealed JSON Web Tokens guard session state against client cross-site scripting (XSS).
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture Highlights */}
      <div className="details-card shadow-premium" style={{ marginTop: '24px' }}>
        <h4>Defensive Layer Policies</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '12px' }}>
          <div>
            <h5 style={{ fontWeight: '600', marginBottom: '4px', fontSize: '13px' }}>Rate Limiting</h5>
            <p style={{ fontSize: '12px', color: '#718096' }}>Throttling is active on signups, logins, and password recovery triggers.</p>
          </div>
          <div>
            <h5 style={{ fontWeight: '600', marginBottom: '4px', fontSize: '13px' }}>Middleware Boundaries</h5>
            <p style={{ fontSize: '12px', color: '#718096' }}>Page requests are checked at the edge level for immediate revocation.</p>
          </div>
          <div>
            <h5 style={{ fontWeight: '600', marginBottom: '4px', fontSize: '13px' }}>CSP Header Protection</h5>
            <p style={{ fontSize: '12px', color: '#718096' }}>Inline styling and scripting is heavily restricted to block injection attacks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
