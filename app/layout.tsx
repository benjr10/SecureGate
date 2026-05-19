import '@/styles/globals.css';
import '@/styles/styles.css';
import { Providers } from './providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SecureGate | Production Identity Platform',
  description: 'A production-grade authentication and security identity access management layer.',
};

export const viewport = 'width=device-width, initial-scale=1';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
