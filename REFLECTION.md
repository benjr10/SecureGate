# SecureGate - Reflection & Engineering Analysis

Name: Odunmbaku Olusola Benjamen
Cohort: Design to MVP Bootcamp
Live URL:
GitHub Repo: https://github.com/benjr10/SecureGate.git
....

## Part 1 — What I Built

I built SecureGate, a focused authentication and security application using Next.js, TypeScript, Prisma, PostgreSQL, NextAuth, and Resend. The app includes secure signup and login flows, email verification, password reset functionality, JWT session handling, protected dashboard routes, middleware-based access control, rate limiting, and password hashing with bcryptjs. I also implemented responsive dashboard and profile pages, proper validation handling, secure error messaging, and a lightweight public landing page to create a cleaner flow before authentication and make the application feel more production-ready.


---

## Part 2 — What Surprised Me

What surprised me most was how many edge cases exist in authentication systems even when the app itself is small. Things like token expiration, session synchronization, generic error handling, rate limiting, and preventing information leakage required much more attention than I initially expected. It made me realize that authentication is less about building forms and more about thinking defensively, assuming users, requests, and sessions can fail in unexpected ways.

## Part 3 — Engineering Laws Quiz

# Q1 — Murphy’s Law

Two places where Murphy’s Law directly influenced defensive design:

## 1. Rate limiting in `lib/auth.ts:34-39`

The NextAuth `authorize` callback checks `checkRateLimit` before even looking up the user.

Without this, a brute-force script could repeatedly hit the login endpoint with password guesses until it eventually finds a weak credential. The rate limiter stops that early. After 5 failed attempts within 15 minutes, the request exits immediately with a `Too many attempts` response.

No database lookup. No password comparison. Just an early block.

## 2. DB session sync in `lib/auth.ts:83-91`

The JWT callback queries the database whenever the token refreshes to sync `emailVerified` status:

```ts
const dbUser = await db.user.findUnique({
  where: { email: token.email },
  select: { emailVerified: true }
})
```

Without this sync, the JWT cookie could still contain stale verification data until the session expires. A user whose email verification was revoked could still keep dashboard access for hours.

Refreshing from the database reduces that window to almost nothing.

---

# Q2 — Law of Leaky Abstractions

**Abstraction:** NextAuth Credentials Provider
**Code reference:** `lib/auth.ts:21-62`

NextAuth’s `authorize` callback looks simple on the surface: validate credentials and either return a user or throw an error.

But some of the underlying behavior still leaks through.

For example, `CredentialsProvider` does not actually create the session itself. It only runs during the sign-in request. JWT signing and cookie creation happen later inside NextAuth’s internal request flow.

Error handling also leaks through the abstraction. If `authorize` throws detailed errors like:

* `User not found`
* `Password comparison failed`

NextAuth can expose parts of that flow through redirects and query parameters.

To avoid leaking information, every failure path returns the same generic message:

```ts
"Invalid email or password"
```

So even though NextAuth abstracts authentication, you still need to understand how its redirect and error pipeline works to avoid exposing sensitive details.

---

# Q3 — YAGNI

Adding social login, MFA, or audit logs at this stage would violate YAGNI because none of them are required for the current scope.

Social login would mean handling OAuth providers, callback flows, account linking, token refresh logic, and provider-specific edge cases before there’s any real need for them.

MFA would introduce TOTP generation, QR codes, recovery flows, device registration, and additional verification steps across the auth system.

Audit logs would require a new database model, logging middleware, retention handling, and a UI to actually view the logs.

The better approach is to add these features only when a real requirement appears.

The current architecture already leaves room for extension:

* social login can be added as another provider
* MFA can plug into the existing auth flow
* audit logging can be introduced as a separate module

But pre-building all of that now would only add complexity to a system that does not need it yet.

---

# Q4 — Kerckhoffs’s Principle (Password Hashing)

A salt is a random value added to a password before hashing so that identical passwords still produce different hashes.

`bcryptjs` automatically handles this by embedding the salt directly into the stored hash.

If the project used plain SHA-256 hashing instead of bcrypt:

## 1. Rainbow tables become effective

Attackers can use precomputed SHA-256 lookup tables for common passwords and reverse many hashes almost instantly.

## 2. Brute-force attacks become practical

SHA-256 is extremely fast, which makes it bad for password storage. Attackers can test massive numbers of password guesses very quickly.

## 3. Shared passwords become obvious

Two users with the same password would produce the same SHA-256 hash, making reused credentials easy to spot.

`bcryptjs` reduces these risks by using unique salts and intentionally slow hashing.

Even if two users choose the same password, their stored hashes will still be completely different.

---

# Q5 — Postel’s Law / Security by Design

**Code reference:** `app/api/auth/forgot-password/route.ts:42-49`

```ts
if (!user) {
  return NextResponse.json(genericResponse);
}
```

The forgot-password endpoint always returns the same response:

```json
{
  "success": true,
  "message": "If an account exists, a reset link has been sent."
}
```

It does not reveal whether the email actually exists.

If valid and invalid emails returned different messages, attackers could use the endpoint to identify registered accounts.

Once attackers know which emails are valid, they can target those users with phishing attempts, credential stuffing, or social engineering.

Returning the same response for every request removes that signal entirely.

---

# Q6 — Boy Scout Rule

**Code reference:** `tokens/design-tokens.css lines 203-368`

While auditing the CSS tokens file, I found two full sets of identical custom properties:

* `--font-*`
* `--typography-*`

For example:

```css
--font-display-display-large-font-size: 63px
```

and

```css
--typography-display-display-large-fontsize: 63px
```

both existed with the same values.

Only the `--font-*` variables were actually being used. The entire `--typography-*` block was dead code adding unnecessary noise.

I removed the duplicate block completely.

It was a small cleanup, but duplicate token systems become confusing over time:

* Which set is the real source of truth?
* Are both still synchronized?
* What happens when someone updates one but not the other?

That kind of inconsistency quietly creates UI bugs later.

---

# Q7 — Gall’s Law

SecureGate was built in stages:

```text
Next.js scaffold
→ Prisma schema
→ shared lib modules
→ API routes
→ auth pages
→ dashboard
→ middleware
→ security hardening
```

Each phase worked before the next one was introduced.

The database layer was tested before authentication depended on it. Signup worked before email verification was connected. Authentication pages existed before dashboard protection was added.

Trying to build everything at once would have made debugging far more difficult because problems in one layer would look like failures somewhere else.

Gall’s Law fits this process well: a working complex system usually grows out of smaller working pieces.

---

# Q8 — Law of Leaky Abstractions (ORM)

**Code reference:** `prisma/schema.prisma lines 10-18`

```prisma
model User {
  id             String   @id @default(uuid())
  name           String
  email          String   @unique
  passwordHash   String
  emailVerified  DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

Prisma abstracts most database behavior, but the underlying PostgreSQL details still matter.

For example, `DateTime?` looks like an optional field in Prisma, but in PostgreSQL it is really a nullable timestamp column.

The `@updatedAt` attribute is another example. Prisma automatically updates the timestamp during ORM operations, but if raw SQL bypasses Prisma, that timestamp no longer updates automatically.

The abstraction works well most of the time, but once you hit performance issues, raw queries, or database edge cases, you still need to understand what PostgreSQL is doing underneath.

---

# Q9 — Zawinski’s Law

**Code reference:** `lib/rate-limit.ts`

NextAuth handled credential verification, but it did not provide abuse protection.

Because of that, I had to build a separate rate-limiting system from scratch using a database-backed sliding window.

That is where Zawinski’s Law becomes relevant.

Once a system starts growing, there is always pressure to keep adding “just one more feature”:

* rate limiting
* IP blocking
* device tracking
* audit logs
* RBAC
* MFA

Without boundaries, an authentication project can slowly turn into a much larger platform.

That is why features like MFA, social login, and audit-log dashboards were intentionally left out of the MVP. The scope stayed focused on:

* authentication
* authorization
* session security

and nothing beyond that.

---

# Q10 — Principle of Least Surprise

**Code reference:** `app/auth/page.tsx lines 109-115`

```ts
if (res?.error) {
  if (res.error.includes('Too many attempts')) {
    setError('Too many attempts. Please try again later.');
  } else {
    setError('Invalid email or password.');
  }
}
```

The login form always shows the same generic error message when credentials fail.

It does not reveal whether:

* the email was wrong
* the password was wrong
* the account does not exist

A login form should either sign the user in or clearly explain that the credentials were invalid.

Detailed errors like:

* `Email not found`
* `Wrong password`

only help attackers identify which field to target.

The `Too many attempts` message follows the same idea. If the user has been rate-limited, the UI explains why the login suddenly stopped working instead of silently failing.

---

# Q11 — Murphy’s Law (Middleware / Session Protection)

**Code reference:** `middleware.ts lines 5-47`

The middleware uses:

```ts
getToken({ req, secret: process.env.NEXTAUTH_SECRET })
```

This reads the session cookie, decrypts the JWT, and checks whether the user is authenticated.

If the token is missing, expired, or invalid, `getToken()` returns `null` and the middleware redirects the user back to `/auth`.

The same fallback path is used whether:

* the cookie was manually deleted
* the session expired
* the token was never issued

Every protected route goes through the same authentication gate, and every invalid session gets the same response.

There is no path where a missing session silently grants access.

---

# Q12 — Kerckhoffs’s Principle (Secret Leak Recovery)

If `NEXTAUTH_SECRET` were committed to GitHub, an attacker could use that secret to forge valid session tokens.

For example, they could generate a JWT containing:

```json
{
  "email": "admin@example.com",
  "emailVerified": true
}
```

and use it as a session cookie.

Because the middleware trusts tokens signed with the correct secret, the forged session would be accepted.

## Recovery steps

1. Rotate the secret immediately.
2. Update the new value in both `.env` and the hosting platform.
3. Force all users to sign in again.
4. Review logs for possible unauthorized access.
5. Ensure `.env` files and secret patterns are excluded from version control.

Kerckhoffs’s Principle says the system should remain secure even if the implementation is public knowledge. The problem here is not the authentication flow itself — it is that the secret protecting it was exposed.

---

# Q13 — Conway’s Law

**Code reference:** Top-level folder structure

```text
SecureGate/
├── app/
├── components/
├── lib/
├── prisma/
├── styles/
├── tokens/
└── public/
```

Conway’s Law says systems naturally reflect the structure of the people building them.

As a solo developer, the folder structure mirrors how I mentally separated the project:

* `lib/` contains shared logic like auth, crypto, email, and database utilities
* `app/` contains pages and API routes
* `components/` contains reusable UI pieces
* `prisma/` handles database structure
* `tokens/` and `styles/` separate design concerns from application logic

In a larger team, these boundaries would likely map directly to different responsibilities across frontend, backend, and design.

---

# Q14 — Technical Debt

**Code reference:** `lib/rate-limit.ts lines 80-91`

```ts
} catch (error) {
  console.error('Rate limit error:', error);

  return {
    success: true,
    count: 0,
    resetTime: now,
  };
}
```

If the database query fails, the rate limiter currently returns `success: true`.

That means temporary database problems like:

* timeouts
* connection exhaustion
* network interruptions

can silently disable rate limiting.

I left this implementation intentionally because the project is still an MVP, and availability was prioritized over infrastructure complexity.

A more reliable approach would introduce multiple layers:

* in-memory limiting as a fast fallback
* database-backed limiting for shared persistence
* optional Redis or edge-level protection later

That would prevent a database outage from completely removing rate limiting.

The current approach still works, but it leaves a gap during infrastructure failures.

---

# Q15 — Synthesis (Adding Payments)

If Flutterwave payments were added to SecureGate, the same engineering principles would still apply, but the consequences would become much more serious.

## Murphy’s Law

Payments introduce many more failure cases:

* a webhook arrives twice
* the payment succeeds but the webhook fails
* the server crashes before recording the transaction
* the user closes the browser before redirect

Because of this, payment flows must be idempotent.

The same transaction should never:

* charge twice
* unlock premium access twice
* create duplicate subscriptions

Transaction references would need to be stored and verified before processing webhooks.

## Kerckhoffs’s Principle

Payment secrets become just as sensitive as authentication secrets.

Values like:

* Flutterwave secret keys
* webhook signing secrets
* encryption keys

must never appear in logs, source code, stack traces, or client-side bundles.

Webhook requests should also verify the `Flutterwave-Signature` header before accepting payment confirmations.

Without that validation, attackers could fake successful payment events.

## Principle of Least Surprise

Payment feedback needs to be clear without exposing internal system details.

Good:

```text
Card declined — try another payment method.
```

Bad:

```text
Flutterwave /charges endpoint returned HTTP 402.
```

After a successful payment, premium access should update immediately without forcing the user to manually refresh the app.

## Postel’s Law

Webhook handlers should tolerate additional fields from future API versions while still validating required data.

That means:

* accepting unknown metadata
* ignoring irrelevant fields
* rejecting invalid signatures
* rejecting malformed payloads

The parser should be flexible in what it accepts but strict about what it trusts.

## Gall’s Law

A payment system should be built in stages:

```text
one-time payments
→ webhook verification
→ subscription state
→ recurring billing
→ retry handling
```

Each stage should already work before the next layer is added.

Trying to build the entire billing system at once would make failures much harder to isolate.

## Zawinski’s Law

Once payments exist, there is immediate pressure to keep expanding:

* invoices
* coupon systems
* analytics
* usage billing
* multi-currency support

Without strict scope boundaries, the project could slowly evolve from an authentication system into a full billing platform.

## Conway’s Law

Payment logic should stay isolated from authentication logic.

For example:

```text
lib/payments.ts
lib/webhooks.ts
app/api/webhooks/flutterwave/route.ts
```

Keeping those concerns separate prevents the codebase from becoming tightly coupled.

A webhook issue should never interfere with authentication or session handling.

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
