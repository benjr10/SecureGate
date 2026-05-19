import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    redirect('/auth');
  }

  // Query database directly in this Server Component to get the timestamps
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/auth');
  }

  return (
    <div>
      <div className="dashboard-welcome-card shadow-premium">
        <h2 className="headline-medium">Profile Metadata</h2>
        <p className="body-medium" style={{ color: '#4a5568', marginTop: '6px' }}>
          Overview of your account identity parameters and registered timestamps.
        </p>
      </div>

      <div className="details-card shadow-premium">
        <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>
          Registered Parameters
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#718096' }}>User ID</span>
            <span style={{ fontSize: '14px', fontFamily: 'monospace', color: '#2d3748', backgroundColor: '#f7fafc', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
              {user.id}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#718096' }}>Full Name</span>
            <span style={{ fontSize: '14px', color: '#2d3748' }}>{user.name}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#718096' }}>Email Address</span>
            <span style={{ fontSize: '14px', color: '#2d3748' }}>{user.email}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#718096' }}>Email Verified</span>
            <span
              style={{
                fontSize: '13px',
                color: user.emailVerified ? 'var(--color-roles-success-roles-on-success-container-color-role)' : 'red',
                fontWeight: '500',
              }}
            >
              {user.emailVerified ? `Verified on ${new Date(user.emailVerified).toLocaleString()}` : 'No'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#718096' }}>Account Created</span>
            <span style={{ fontSize: '14px', color: '#2d3748' }}>
              {new Date(user.createdAt).toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#718096' }}>Last Updated</span>
            <span style={{ fontSize: '14px', color: '#2d3748' }}>
              {new Date(user.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="alert alert-warning" style={{ marginTop: '24px' }}>
        <svg
          style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px' }}
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
        <div>
          <strong>Security Notice:</strong> Profile parameters are read-only. SecureGate maintains full audit logs of account adjustments. To make updates, contact security administrators.
        </div>
      </div>
    </div>
  );
}
