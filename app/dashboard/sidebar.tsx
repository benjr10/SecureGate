'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <aside className="dashboard-sidebar">
      {/* Brand logo */}
      <div className="sidebar-brand">
        <Link href="/dashboard" className="brand-logo" style={{ textDecoration: 'none' }}>
          <svg
            className="logo-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '22px', height: '22px' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>SecureGate</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <Link
          href="/dashboard"
          className={`sidebar-nav-item ${pathname === '/dashboard' ? 'active' : ''}`}
        >
          <svg
            className="sidebar-nav-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
            />
          </svg>
          <span>Dashboard</span>
        </Link>

        <Link
          href="/dashboard/profile"
          className={`sidebar-nav-item ${pathname === '/dashboard/profile' ? 'active' : ''}`}
        >
          <svg
            className="sidebar-nav-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>Profile</span>
        </Link>
      </nav>

      {/* User info & Logout */}
      <div className="sidebar-user-footer">
        <div className="user-footer-info">
          <span className="user-footer-name">{user.name || 'Secure User'}</span>
          <span className="user-footer-email">{user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-full"
          style={{ padding: '8px 12px', fontSize: '12px' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <svg
              style={{ width: '14px', height: '14px' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
