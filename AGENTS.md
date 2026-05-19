# AGENTS.md

## Product Overview

SecureGate is a standalone authentication and security system designed to demonstrate production-grade identity and access management principles.

The platform focuses strictly on:
- Authentication
- Authorization
- Session security
- Email verification
- Password recovery
- Protected routes
- Defensive security architecture

This is NOT a full SaaS platform.

The system should behave like a reusable authentication layer that could be extracted into a serious production application.

---

## Core Product Goals

The product must:
- Allow users to create accounts
- Require email verification before dashboard access
- Support secure login/logout flows
- Support password reset flows
- Protect authenticated routes
- Prevent brute-force attacks
- Expire sensitive tokens automatically
- Prevent sensitive information leakage
- Use secure session handling
- Maintain a clean and trustworthy UX

---

## Product Scope

### Included in MVP
- Landing page
- Unified Auth page
- Login flow
- Signup flow
- Email verification
- Protected dashboard
- Forgot password
- Reset password
- Logout
- Session validation
- Rate limiting
- Password hashing
- Security headers
- Responsive UI

### Excluded from MVP
- Social login
- MFA
- RBAC
- Billing systems
- Team systems
- Notifications center
- Analytics dashboard
- User management systems
- OAuth providers
- Audit log UI
- Gamification
- Chat systems

---

## Authentication Architecture Rules

### Unified Authentication Page

Login and Signup MUST exist inside one page:
- `/auth`

Do NOT create:
- `/login`
- `/signup`

The Auth page should:
- Support switching between login and signup states
- Preserve layout consistency
- Feel fast on mobile
- Avoid unnecessary route transitions

---

## Dashboard Architecture Rules

Dashboard must use:
- Shared layout routing architecture

Do NOT create:
- Fully isolated standalone dashboard pages

Required structure:
- `/dashboard`
- `/dashboard/profile`

Dashboard layout must:
- Persist sidebar/navigation
- Persist shell layout
- Only update inner content views

Navigation should feel:
- Fast
- App-like
- Minimal

---

## Dashboard Navigation

Allowed navigation items:
- Dashboard
- Profile

Avoid:
- Deep nested routing
- Complex menu systems
- Multi-sidebar layouts

---

## UX Principles

The product should feel:
- Secure
- Minimal
- Calm
- Modern
- Predictable
- Professional

Avoid:
- Cluttered interfaces
- Excessive animations
- Over-designed dashboards
- Confusing navigation
- Aggressive UX patterns

---

## Security Principles

Never:
- Store plain text passwords
- Leak sensitive auth errors
- Expose whether an email exists
- Trust client validation alone
- Store secrets in source code

Always:
- Validate on server
- Hash passwords securely
- Expire tokens automatically
- Protect routes at middleware level
- Use environment variables
- Apply rate limiting

---

## Required System Behaviors

### Unverified Users
- Cannot access dashboard
- Must be redirected safely
- Must receive verification prompts

### Invalid Credentials
Return generic errors:
- "Invalid email or password"

### Expired Tokens
- Show expiration state
- Allow resend/retry flow

### Rate Limit Exceeded
- Temporarily block request
- Return safe retry messaging

### Invalid Sessions
- Redirect to auth
- Clear stale state safely

---

## Data Models

### User
Fields:
- id
- name
- email
- passwordHash
- emailVerified
- createdAt
- updatedAt

### VerificationToken
Fields:
- identifier
- token
- expiresAt

### PasswordResetToken
Fields:
- email
- token
- expiresAt

---

## Technical Constraints

The AI agent must:
- Keep implementation MVP-focused
- Avoid introducing unrelated features
- Avoid unnecessary abstractions
- Avoid over-engineering
- Maintain mobile responsiveness
- Maintain clean folder structure
- Maintain reusable component patterns

---

## Form Validation Requirements

All user input must:
- Be validated client-side
- Be validated server-side
- Return safe error messages
- Prevent malformed requests

Password fields must:
- Include strength indicators
- Include validation messaging
- Enforce minimum security standards

---

## Routing Rules

Required routes:
- `/`
- `/auth`
- `/verify-email/[token]`
- `/forgot-password`
- `/reset-password/[token]`
- `/dashboard`

Avoid unnecessary routes.

---

## Layout Rules

### Public Layout
Used for:
- Landing page
- Auth pages

### Dashboard Layout
Used for:
- Authenticated dashboard views

Dashboard layout must persist during navigation.

---

## State Management Rules

Avoid:
- Overcomplicated global state
- Duplicate auth state
- Multiple session sources

Prefer:
- Centralized session handling
- Predictable loading states
- Clear auth transitions

---

## Loading States

Required for:
- Login
- Signup
- Email verification
- Password reset
- Session validation

All loading states should:
- Be minimal
- Prevent duplicate actions
- Provide user feedback

---

## Error Handling Rules

Safe fallback:
- "Something went wrong. Please try again later."

Never expose:
- Stack traces
- DB errors
- Token internals
- Authentication internals

---

## Mobile-First Requirements

Prioritize:
- Small-screen usability
- Touch-friendly spacing
- Fast interactions
- Readability
- Low cognitive load

---

## AI Agent Build Priorities

Priority order:
1. Security correctness
2. Authentication reliability
3. Route protection
4. Token lifecycle handling
5. UX clarity
6. Mobile responsiveness
7. Clean architecture
8. Reusability
9. Performance
10. Visual polish