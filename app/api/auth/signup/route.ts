import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateSecureToken, validatePasswordStrength } from '@/lib/crypto';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateOrigin } from '@/lib/csrf';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export async function POST(req: Request) {
  try {
    const csrfCheck = validateOrigin(req);
    if (csrfCheck) return csrfCheck;

    // Determine client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `signup:ip:${ip}`;
    // Limit signup requests to 5 per 15 minutes per IP
    const rateLimitResult = await checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Validate password strength server-side
    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return NextResponse.json(
        { error: strength.errors[0] },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Return generic success to prevent email existence enumeration
      return NextResponse.json({
        success: true,
        message: 'If this email is available, a verification link has been sent.',
      });
    }

    // Hash the password securely
    const passwordHash = await hashPassword(password);

    // Create the user (unverified state)
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    // Generate secure email verification token
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    await db.verificationToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    });

    // Send email verification link
    await sendVerificationEmail(user.email, user.name, token);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
    });
  } catch (error) {
    console.error('Signup route error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
