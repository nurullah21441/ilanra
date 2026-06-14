import { Resend } from "resend";
import { SITE_NAME } from "@/lib/site";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/** Domain verify edilmeden Resend'in test gönderici adresi */
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function resendFrom() {
  return `${SITE_NAME} <${RESEND_FROM}>`;
}

function isDevEmailFallbackEnabled() {
  return process.env.NODE_ENV === "development";
}

type SavedSearchAlertPayload = {
  searchLabel: string;
  listingTitle: string;
  listingPrice: string;
  listingCity: string;
  listingUrl: string;
  searchUrl: string;
};

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
    from: resendFrom(),
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email] Resend hatası:", error);
    if (isDevEmailFallbackEnabled()) {
      console.info("[email] Dev fallback — şifre sıfırlama linki:", resetUrl);
      return { ok: true as const, dev: true as const };
    }
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
    from: resendFrom(),
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email] Resend hatası:", error);
    if (isDevEmailFallbackEnabled()) {
      console.info("[email] Dev fallback — doğrulama linki:", verifyUrl);
      return { ok: true as const, dev: true as const, verifyUrl };
    }
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, dev: false as const };
}

export async function sendSavedSearchAlertEmail(to: string, payload: SavedSearchAlertPayload) {
  const subject = `${SITE_NAME} — Kayıtlı araman için yeni ilan`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#111;margin:0 0 12px">${SITE_NAME}</h2>
      <p style="color:#444;line-height:1.6">
        <strong>${payload.searchLabel}</strong> kayıtlı aramanla eşleşen yeni bir ilan yayınlandı.
      </p>
      <div style="margin:20px 0;padding:16px;border:1px solid #eee;border-radius:10px;background:#fafaf8">
        <div style="font-size:16px;font-weight:700;color:#111;margin-bottom:6px">${payload.listingTitle}</div>
        <div style="font-size:14px;color:#555">₺${payload.listingPrice} · ${payload.listingCity}</div>
      </div>
      <p style="margin:24px 0">
        <a href="${payload.listingUrl}" style="display:inline-block;padding:12px 24px;background:#D92D26;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-right:8px">İlanı gör</a>
        <a href="${payload.searchUrl}" style="display:inline-block;padding:12px 24px;background:#f5f5f3;color:#333;text-decoration:none;border-radius:8px;font-weight:600">Tüm sonuçlar</a>
      </p>
      <p style="color:#888;font-size:13px;line-height:1.5">Bu bildirimi istemiyorsan profilinden kayıtlı aramayı silebilirsin.</p>
    </div>
  `;

  if (!resend) {
    console.info("[email] RESEND_API_KEY yok — kayıtlı arama bildirimi:", {
      to,
      search: payload.searchLabel,
      listing: payload.listingTitle,
      listingUrl: payload.listingUrl,
    });
    return { ok: true as const, dev: true as const };
  }

  const { error } = await resend.emails.send({
    from: resendFrom(),
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email] Kayıtlı arama bildirimi hatası:", error);
    if (isDevEmailFallbackEnabled()) {
      console.info("[email] Dev fallback — kayıtlı arama bildirimi:", payload);
      return { ok: true as const, dev: true as const };
    }
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, dev: false as const };
}
