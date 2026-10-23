import nodemailer from "nodemailer";
import { config } from "../config.js";
import { HttpError } from "./http.js";

const transport = config.SMTP_HOST
  ? nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: config.SMTP_USER
        ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
        : undefined,
    })
  : null;

export async function sendAuthCode(email: string, code: string) {
  if (config.PUBLIC_SANDBOX) return; // Browser-bound test codes are shown in the UI, never emailed or logged.
  if (!transport) {
    if (config.NODE_ENV === "production")
      throw new HttpError(
        503,
        "Отправка писем временно недоступна.",
        "mail_unavailable",
      );
    console.info(`[local auth] code for ${email}: ${code}`);
    return;
  }
  await transport.sendMail({
    from: config.SMTP_FROM,
    to: email,
    subject: "Код входа в Founders Club",
    text: `Ваш код: ${code}. Он действует 10 минут. Если вы не запрашивали вход, проигнорируйте письмо.`,
    html: `<p>Ваш код входа:</p><p style="font-size:28px;letter-spacing:4px"><strong>${code}</strong></p><p>Код действует 10 минут.</p>`,
  });
}
