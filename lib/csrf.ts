import { NextResponse } from 'next/server';

const allowedOrigin = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Validates that a request originated from the same origin as the app.
 * Returns a 403 response if the origin is invalid, or null if the check passes.
 */
export function validateOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  const isValidOrigin = origin === allowedOrigin;
  const isValidReferer = referer?.startsWith(allowedOrigin);

  if (isValidOrigin || isValidReferer) {
    return null;
  }

  return NextResponse.json(
    { error: 'Something went wrong. Please try again later.' },
    { status: 403 }
  );
}
