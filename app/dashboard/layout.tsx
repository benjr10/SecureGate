import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DashboardSidebar from './sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // 1. Security boundary check: check session presence
  if (!session || !session.user) {
    redirect('/auth');
  }

  // 2. Security boundary check: verify user email has been verified
  const emailVerified = (session.user as any).emailVerified;
  if (!emailVerified) {
    redirect('/verify-prompt');
  }

  return (
    <div className="dashboard-layout-wrapper">
      {/* Persistent Sidebar */}
      <DashboardSidebar user={session.user} />

      {/* Main Content Area */}
      <div className="dashboard-content-frame">
        <header className="dashboard-header">
          <div className="dashboard-header-title">Identity & Access Panel</div>
          <div style={{ fontSize: '12px', color: '#718096', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-roles-success-roles-success-color-role)',
                display: 'inline-block',
              }}
            />
            Session Active
          </div>
        </header>

        <main className="dashboard-main-view">{children}</main>
      </div>
    </div>
  );
}
