import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 1025,
      secure: false,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    })
  : null;

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendMail = async (options: MailOptions) => {
  if (!transporter) {
    logger.warn("SMTP is not configured; email was not sent");
    return;
  }

  await transporter.sendMail({
    from: env.MAIL_FROM,
    ...options,
  });
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const url = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await sendMail({
    to,
    subject: "Verifikasi email Re:Buy",
    text: `Verifikasi email kamu melalui tautan berikut: ${url}`,
    html: `
      <p>Halo,</p>
      <p>Terima kasih sudah mendaftar di Re:Buy.</p>
      <p><a href="${url}">Klik di sini untuk verifikasi email</a></p>
      <p>Tautan ini berlaku selama 24 jam.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const url = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await sendMail({
    to,
    subject: "Reset password Re:Buy",
    text: `Reset password kamu melalui tautan berikut: ${url}`,
    html: `
      <p>Halo,</p>
      <p>Kami menerima permintaan reset password untuk akun ini.</p>
      <p><a href="${url}">Klik di sini untuk membuat password baru</a></p>
      <p>Tautan ini berlaku selama 1 jam. Abaikan email ini jika kamu tidak meminta reset.</p>
    `,
  });
};
