import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateOrigin } from '@/lib/csrf';

export async function POST(req: Request) {
  try {
    const csrfCheck = validateOrigin(req);
    if (csrfCheck) return csrfCheck;

    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `verify:ip:${ip}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Verification link is invalid.' },
        { status: 400 }
      );
    }

    // Find verification token in database
    const dbToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!dbToken || new Date() > dbToken.expiresAt) {
      // Generic error — do not distinguish invalid, used, or expired tokens
      return NextResponse.json(
        { error: 'Verification link is invalid or has expired.' },
        { status: 400 }
      );
    }

    // Update user's emailVerified date
    await db.user.update({
      where: { email: dbToken.email },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete verification token after successful verification (single-use)
    await db.verificationToken.delete({
      where: { id: dbToken.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
