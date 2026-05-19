'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function NavPrefetcher() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/auth');
    router.prefetch('/forgot-password');
  }, [router]);

  return null;
}
