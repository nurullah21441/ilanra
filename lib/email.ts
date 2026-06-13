import { Resend } from "resend";
import { SITE_EMAIL, SITE_NAME } from "@/lib/site";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = `${SITE_NAME} — Şifre sıfırlama`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#111;margin:0 0 12px">${SITE_NAME}</h2>
      <p style="color:#444;line-height:1.6">Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın. Link 1 saat geçerlidir.</p>
      <p style="margin:24px 0">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#D92D26;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Şifremi sıfırla</a>
      </p>
      <p style="color:#888;font-size:13px;line-height:1.5">Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
    </div>
  `;

  if (!resend) {
    console.info("[email] RESEND_API_KEY yok — şifre sıfırlama linki:", resetUrl);
    return { ok: true as const, dev: true as const };
  }

  const { error } = await resend.emails.send({
    from: `${SITE_NAME} <${SITE_EMAIL}>`,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email] Resend hatası:", error);
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, dev: false as const };
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const subject = `${SITE_NAME} — E-posta doğrulama`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#111;margin:0 0 12px">${SITE_NAME}</h2>
      <p style="color:#444;line-height:1.6">Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın. Link 24 saat geçerlidir.</p>
      <p style="margin:24px 0">
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#D92D26;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">E-postamı doğrula</a>
      </p>
      <p style="color:#888;font-size:13px;line-height:1.5">Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
    </div>
  `;

  if (!resend) {
    console.info("[email] RESEND_API_KEY yok — doğrulama linki:", verifyUrl);
    return { ok: true as const, dev: true as const, verifyUrl };
  }

  const { error } = await resend.emails.send({
    from: `${SITE_NAME} <${SITE_EMAIL}>`,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email] Resend hatası:", error);
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, dev: false as const };
}
