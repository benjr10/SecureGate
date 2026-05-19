# SecureGate - Reflection & Engineering Analysis

Name: Odunmbaku Olusola Benjamen
Cohort: Design to MVP Bootcamp
Live URL: https://secure-gate-kohl.vercel.app/
GitHub Repo: https://github.com/benjr10/SecureGate.git
....

## Part 1 — What I Built

I built SecureGate, a focused authentication and security application using Next.js, TypeScript, Prisma, PostgreSQL, NextAuth, and Resend. The app includes secure signup and login flows, email verification, password reset functionality, JWT session handling, protected dashboard routes, middleware-based access control, rate limiting, and password hashing with bcryptjs. I also implemented responsive dashboard and profile pages, proper validation handling, secure error messaging, and a lightweight public landing page to create a cleaner flow before authentication and make the application feel more production-ready.


---

## Part 2 — What Surprised Me

What surprised me most was how many edge cases exist in authentication systems even when the app itself is small. Things like token expiration, session synchronization, generic error handling, rate limiting, and preventing information leakage required much more attention than I initially expected. It made me realize that authentication is less about building forms and more about thinking defensively, assuming users, requests, and sessions can fail in unexpected ways.

## Part 3 — Engineering Laws Quiz

# Q1 — Murphy’s Law

Code reference: `lib/auth.ts:34-39` and `lib/auth.ts:83-91`

Murphy’s Law influenced a lot of the security decisions in SecureGate because I had to assume users or attackers would eventually try to break things.

One example is the rate limiting inside the login flow. Before checking the user’s password, the app first checks how many failed attempts were made recently. If there are too many attempts, the request gets blocked immediately. This helps reduce brute-force attacks.

Another example is how the JWT session refreshes verification status from the database. Without this, a user could still keep access with outdated session data even after their verification state changes.

---

# Q2 — Law of Leaky Abstractions

Code reference: `lib/auth.ts:21-62`

I used NextAuth for authentication because it hides a lot of complexity, but some implementation details still leak through.

For example, the Credentials Provider only validates the login request. The actual JWT creation and cookie handling happen later internally. Error handling also leaks through because detailed errors can accidentally expose information about valid accounts.

To avoid this, all login failures return the same message: “Invalid email or password.”

---

# Q3 — YAGNI

Code reference: `lib/auth.ts`, `middleware.ts`, and `app/api/auth/*`

I intentionally avoided adding features like social login, MFA, and audit logs because the project did not need them yet.

Those features would add a lot more complexity to the authentication system. Instead, I focused on making the core signup, login, verification, and session flow stable first.

The current structure still leaves room to add those features later if needed.

---

# Q4 — Kerckhoffs’s Principle (Password Hashing)

Code reference: `lib/auth.ts` and `app/api/auth/register/route.ts`

Passwords are hashed with bcryptjs before being stored in the database.

bcrypt automatically adds a salt to every password hash, which means even users with the same password will still have completely different hashes stored.

If I had used plain SHA-256 instead, password cracking would become much easier because SHA-256 is very fast and vulnerable to rainbow table attacks.

---

# Q5 — Postel’s Law / Security by Design

Code reference: `app/api/auth/forgot-password/route.ts:42-49`

The forgot-password endpoint always returns the same response whether the email exists or not.

This prevents attackers from checking which emails are registered in the system.

If the app exposed different responses for valid and invalid emails, attackers could use that information for phishing or credential stuffing attempts.

---

# Q6 — Boy Scout Rule

Code reference: `tokens/design-tokens.css:203-368`

While reviewing the design tokens file, I noticed there were two sets of typography variables that contained almost identical values.

Only one set was actually being used, so I removed the unused duplicate variables to reduce confusion and keep the file cleaner.

It was a small cleanup, but small inconsistencies like that can cause bigger maintenance issues later.

---

# Q7 — Gall’s Law

Code reference: `app/`, `lib/`, `prisma/`, and `middleware.ts`

SecureGate was built step by step instead of trying to build everything at once.

I first made sure the database worked, then signup, then authentication pages, then dashboard protection and middleware.

Building it gradually made debugging easier because each layer was already working before the next one depended on it.

---

# Q8 — Law of Leaky Abstractions (ORM)

Code reference: `prisma/schema.prisma:10-18`

Prisma simplifies database work a lot, but PostgreSQL behavior still matters underneath.

For example, optional Prisma fields are still nullable database columns behind the scenes. Also, Prisma automatically updates some timestamps, but raw SQL queries would bypass that behavior.

The abstraction helps productivity, but understanding the database layer is still important.

---

# Q9 — Zawinski’s Law

Code reference: `lib/rate-limit.ts`

While building authentication, I noticed how easy it is for projects to keep growing endlessly.

At first it starts with login and signup, then suddenly there’s pressure to add rate limiting, MFA, audit logs, RBAC, device tracking, and more.

To avoid overcomplicating the MVP, I kept the scope focused mainly on authentication, authorization, and session security.

---

# Q10 — Principle of Least Surprise

Code reference: `app/auth/page.tsx:109-115`

The login form always shows the same generic error message when authentication fails.

It does not reveal whether the email or password was specifically incorrect.

This keeps the experience simple for normal users while also reducing information leakage that attackers could use.

---

# Q11 — Murphy’s Law (Middleware / Session Protection)

Code reference: `middleware.ts:5-47`

The middleware checks every protected route for a valid session token.

If the token is missing, expired, or invalid, the user is redirected back to the auth page automatically.

This prevents situations where a broken or missing session accidentally grants access to protected pages.

---

# Q12 — Kerckhoffs’s Principle (Secret Leak Recovery)

Code reference: `.env`, `middleware.ts`, and `lib/auth.ts`

If the NEXTAUTH_SECRET leaked publicly, attackers could generate fake session tokens and impersonate users.

The first step would be rotating the secret immediately and updating it everywhere the app is deployed.

All users would also need to sign in again so old tokens become invalid.

---

# Q13 — Conway’s Law

Code reference: `app/`, `components/`, `lib/`, `prisma/`, `styles/`, and `tokens/`

The folder structure reflects how I mentally separated the project while building it.

Shared logic lives in `lib/`, routes and pages are inside `app/`, reusable UI is in `components/`, and database structure is handled in `prisma/`.

As the project grows, these boundaries help keep responsibilities organized.

---

# Q14 — Technical Debt

Code reference: `lib/rate-limit.ts:80-91`

The current rate limiter allows requests if the database temporarily fails.

I left this behavior intentionally for the MVP because I prioritized keeping authentication available during temporary database issues.

A better long-term solution would combine database storage with in-memory or Redis-based limiting for stronger reliability.

---

# Q15 — Synthesis (Adding Payments)

Code reference: `lib/auth.ts`, `middleware.ts`, and `app/api/*`

If payments were added later, the same engineering principles would still apply.

For example, payment webhooks would need idempotency so duplicate requests do not charge users multiple times.

Secrets and webhook signatures would also need strong validation to prevent fake payment events.

I would also build the payment system gradually instead of trying to add subscriptions, invoices, analytics, and billing logic all at once.


## Part 4 — One Thing I Would Refactor

One thing I would refactor is the current rate-limiting fallback logic inside lib/rate-limit.ts. Right now, if the database becomes temporarily unavailable, the catch block returns success: true, which means rate limiting is effectively bypassed during that failure window.

I accepted this trade-off because the project is still an MVP and I wanted to avoid introducing extra infrastructure complexity too early. However, as the app grows, this becomes a real security and scalability concern because a database outage could temporarily remove brute-force protection from authentication endpoints.

The better long-term approach would be a layered rate-limiting system with:

an in-memory fallback

database-backed persistence

optional Redis or edge-level protection


This would allow the application to continue enforcing limits even if one layer fails.

Refactored Direction

const memoryStore = new Map();

export async function checkRateLimit(key: string) {
  const memoryEntry = memoryStore.get(key);

  if (memoryEntry) {
    return memoryEntry;
  }

  try {
    // database-backed rate limit logic
  } catch {
    // fallback to memory-based protection
    return fallbackProtection();
  }
}


---

## Part 5 — How This Changes How I Build

Before building SecureGate, I mostly saw authentication as forms, sessions, and database queries. Working on this project changed how I think about security and software engineering completely.

I learned that authentication systems are mostly about defensive thinking. Small decisions like generic error messages, token expiration, middleware redirects, session validation, and rate limiting have major security implications if handled incorrectly.

I also understood why engineering principles matter in real projects. Laws like Murphy’s Law, YAGNI, Gall’s Law, and the Principle of Least Surprise stopped being theory and started influencing actual implementation decisions while building the app.

The project also changed how I approach scope. Instead of adding features just because they sound impressive, I became more intentional about keeping systems focused, maintainable, and aligned with the original goal of the product.
