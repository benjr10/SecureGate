import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resendApiKey = process.env.RESEND_API_KEY;
const senderEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const resend =
  resendApiKey && !resendApiKey.includes('placeholder')
    ? new Resend(resendApiKey)
    : null;

function logEmailToFile(subject: string, to: string, url: string) {
  try {
    const dirPath = path.join(process.cwd(), 'artifacts');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const logFilePath = path.join(dirPath, 'email_logs.txt');
    const logMessage = `[${new Date().toISOString()}] To: ${to} | Subject: ${subject} | Link: ${url}\n`;
    fs.appendFileSync(logFilePath, logMessage, 'utf8');

    console.log('\n==================================================');
    console.log(`EMAIL LOGGED (${subject}):`);
    console.log(`Recipient: ${to}`);
    console.log(`Link:      ${url}`);
    console.log('==================================================\n');
  } catch (err) {
    console.error('Failed to log email to file:', err);
  }
}

const emailContainerStyle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  color: '#333',
  padding: '24px',
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
};

const emailButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#037ce6',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '4px',
  textDecoration: 'none',
  fontWeight: '500',
  marginTop: '16px',
  marginBottom: '16px',
};

const emailFooterStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#666',
  marginTop: '24px',
};

const emailCopyrightStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#999',
};

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />;
}

export function VerificationEmail({ name, url }: { name: string; url: string }) {
  return (
    <div style={emailContainerStyle}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Verify Your Email Address</h2>
      <p>Hello {name},</p>
      <p>
        Thank you for signing up for SecureGate. To complete your registration and access the dashboard, please click the button below to verify your email address:
      </p>
      <a href={url} style={emailButtonStyle}>
        Verify Email Address
      </a>
      <p style={emailFooterStyle}>
        If you did not request this email, please ignore it. This verification link will expire in 24 hours.
      </p>
      <Divider />
      <p style={emailCopyrightStyle}>SecureGate - Identity & Access Layer</p>
    </div>
  );
}

export function ResetPasswordEmail({ url }: { url: string }) {
  return (
    <div style={emailContainerStyle}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Reset Your Password</h2>
      <p>Hello,</p>
      <p>
        We received a request to reset the password for your SecureGate account. Click the button below to set a new password:
      </p>
      <a href={url} style={emailButtonStyle}>
        Reset Password
      </a>
      <p style={emailFooterStyle}>
        If you did not make this request, you can safely ignore this email. The link will expire in 1 hour.
      </p>
      <Divider />
      <p style={emailCopyrightStyle}>SecureGate - Identity & Access Layer</p>
    </div>
  );
}

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const url = `${appUrl}/verify-email/${token}`;

  logEmailToFile('Verify Email', email, url);

  if (resend) {
    try {
      await resend.emails.send({
        from: senderEmail,
        to: email,
        subject: 'Verify your email - SecureGate',
        react: <VerificationEmail name={name} url={url} />,
      });
    } catch (error) {
      console.error('Failed to send verification email via Resend:', error);
    }
  }
}

export async function sendResetPasswordEmail(email: string, token: string): Promise<void> {
  const url = `${appUrl}/reset-password/${token}`;

  logEmailToFile('Reset Password', email, url);

  if (resend) {
    try {
      await resend.emails.send({
        from: senderEmail,
        to: email,
        subject: 'Reset your password - SecureGate',
        react: <ResetPasswordEmail url={url} />,
      });
    } catch (error) {
      console.error('Failed to send password reset email via Resend:', error);
    }
  }
}
