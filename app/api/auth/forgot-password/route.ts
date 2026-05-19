import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSecureToken } from '@/lib/crypto';
import { sendResetPasswordEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateOrigin } from '@/lib/csrf';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const csrfCheck = validateOrigin(req);
    if (csrfCheck) return csrfCheck;

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await req.json();

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Apply rate limit per Email/IP to prevent spam
    const rateLimitKey = `forgot-password:email:${email.toLowerCase()}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000); // 3 requests per 15 minutes
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

    // Generic response regardless of whether user exists for security
    const genericResponse = {
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    };

    if (!user) {
      return NextResponse.json(genericResponse);
    }

    // Delete any old reset tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Generate secure token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiration

    await db.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    });

    // Send reset email
    await sendResetPasswordEmail(user.email, token);

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error('Forgot password route error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
