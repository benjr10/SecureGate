import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, validatePasswordStrength } from '@/lib/crypto';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateOrigin } from '@/lib/csrf';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string(),
});

export async function POST(req: Request) {
  try {
    const csrfCheck = validateOrigin(req);
    if (csrfCheck) return csrfCheck;

    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `reset-password:ip:${ip}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Verify password strength
    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return NextResponse.json(
        { error: strength.errors[0] },
        { status: 400 }
      );
    }

    // Look up password reset token
    const dbToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!dbToken || new Date() > dbToken.expiresAt) {
      // Generic error — do not distinguish invalid, used, or expired
      return NextResponse.json(
        { error: 'Reset link is invalid or has expired.' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: dbToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Something went wrong. Please try again later.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await hashPassword(password);

    // Update user password
    await db.user.update({
      where: { email: user.email },
      data: {
        passwordHash,
      },
    });

    // Invalidate/delete the password reset token
    await db.passwordResetToken.delete({
      where: { id: dbToken.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now log in.',
    });
  } catch (error) {
    console.error('Reset password route error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
