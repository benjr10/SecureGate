import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSecureToken } from '@/lib/crypto';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateOrigin } from '@/lib/csrf';
import { z } from 'zod';

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const csrfCheck = validateOrigin(req);
    if (csrfCheck) return csrfCheck;

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await req.json();

    const parsed = resendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Apply rate limit per Email
    const rateLimitKey = `resend:email:${email.toLowerCase()}`;
    // Limit to 3 resends per 15 minutes
    const rateLimitResult = await checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Lookup user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.emailVerified) {
      // Return generic response to prevent email harvesting and existence leakage
      return NextResponse.json({
        success: true,
        message: 'If an account exists and is unverified, a verification link has been sent.',
      });
    }

    // Delete existing verification tokens for this email
    await db.verificationToken.deleteMany({
      where: { email: user.email },
    });

    // Generate new token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    await db.verificationToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    });

    // Send email
    await sendVerificationEmail(user.email, user.name, token);

    return NextResponse.json({
      success: true,
      message: 'Verification link sent successfully.',
    });
  } catch (error) {
    console.error('Resend verification link error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
