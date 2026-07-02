import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

// Create transporter lazily — only when SMTP env vars are present
function getTransporter() {
  if (
    !env.SMTP_HOST ||
    !env.SMTP_USER ||
    !env.SMTP_PASS
  ) {
    throw new Error(
      "Email service is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env"
    );
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

const FROM_ADDRESS = '"Decor Platform" <no-reply@decorplatform.co.ke>';

// ─── Email verification ───────────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  fullName: string,
  token: string
) {
  const verifyUrl = `${env.CORS_ORIGIN}/verify-email?token=${token}`;

  await getTransporter().sendMail({
    from: FROM_ADDRESS,
    to,
    subject: "Verify your Decor Platform account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D3748;">Welcome to Decor Platform, ${fullName}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 24px;background:#C9A84C;
                  color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          Verify Email
        </a>
        <p style="color:#718096;font-size:14px;margin-top:24px;">
          This link expires in 24 hours. If you did not create an account, ignore this email.
        </p>
      </div>
    `,
  });
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  fullName: string,
  token: string
) {
  const resetUrl = `${env.CORS_ORIGIN}/reset-password?token=${token}`;

  await getTransporter().sendMail({
    from: FROM_ADDRESS,
    to,
    subject: "Reset your Decor Platform password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D3748;">Password Reset Request</h2>
        <p>Hi ${fullName}, we received a request to reset your password.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#C9A84C;
                  color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#718096;font-size:14px;margin-top:24px;">
          This link expires in 1 hour. If you did not request this, ignore this email.
        </p>
      </div>
    `,
  });
}

// ─── Order confirmation ───────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  to: string,
  fullName: string,
  orderId: string,
  totalAmount: number
) {
  const orderUrl = `${env.CORS_ORIGIN}/orders/${orderId}`;

  await getTransporter().sendMail({
    from: FROM_ADDRESS,
    to,
    subject: `Order Confirmed — #${orderId.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D3748;">Thank you for your order, ${fullName}!</h2>
        <p>Your order has been received and is being processed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr>
            <td style="padding:8px;color:#718096;">Order ID</td>
            <td style="padding:8px;font-weight:600;">#${orderId.slice(0, 8).toUpperCase()}</td>
          </tr>
          <tr style="background:#F7FAFC;">
            <td style="padding:8px;color:#718096;">Total</td>
            <td style="padding:8px;font-weight:600;">KES ${totalAmount.toLocaleString()}</td>
          </tr>
        </table>
        <a href="${orderUrl}"
           style="display:inline-block;padding:12px 24px;background:#C9A84C;
                  color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          Track Your Order
        </a>
      </div>
    `,
  });
}

// ─── Order status update ──────────────────────────────────────────────────────

export async function sendOrderStatusEmail(
  to: string,
  fullName: string,
  orderId: string,
  status: string
) {
  const statusMessages: Record<string, string> = {
    PAID: "Payment confirmed — your order is being prepared.",
    PROCESSING: "Your order is being processed and will ship soon.",
    SHIPPED: "Your order is on its way!",
    DELIVERED: "Your order has been delivered. Enjoy your new décor!",
    CANCELLED: "Your order has been cancelled. Contact us if you have questions.",
  };

  const message = statusMessages[status] ?? `Your order status has been updated to ${status}.`;
  const orderUrl = `${env.CORS_ORIGIN}/orders/${orderId}`;

  await getTransporter().sendMail({
    from: FROM_ADDRESS,
    to,
    subject: `Order Update — ${status}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D3748;">Order Update, ${fullName}</h2>
        <p>${message}</p>
        <a href="${orderUrl}"
           style="display:inline-block;padding:12px 24px;background:#C9A84C;
                  color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
          View Order
        </a>
      </div>
    `,
  });
}