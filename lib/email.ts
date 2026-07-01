// lib/email.ts — envoi du lien personnel par email via Resend.
// Tolérant : si RESEND_API_KEY n'est pas configuré, on n'envoie rien et on
// retourne false (le lien reste affiché à l'écran, rien ne bloque).

import type { Lang } from "@core";

const C = { ink: "#1A1A28", brass: "#C9A45C", porcelain: "#F3ECE1", muted: "#9A93A8" };

export async function sendPersonalLink(opts: {
  to: string;
  name: string;
  url: string;
  lang: Lang;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Florilège <onboarding@resend.dev>";
  if (!apiKey || !opts.to) return false;

  const { to, name, url, lang } = opts;
  const t =
    lang === "fr"
      ? {
          subject: "Votre florilège Optimup",
          hi: `Bonjour ${name},`,
          body: "Voici le lien pour retrouver votre florilège quand vous le souhaitez, et lancer le regard des autres (360) plus tard :",
          cta: "Voir mon florilège",
          foot: "Conservez ce lien : il donne accès à votre résultat.",
        }
      : {
          subject: "Your Optimup florilège",
          hi: `Hello ${name},`,
          body: "Here is the link to come back to your florilège anytime, and launch the 360 later:",
          cta: "See my florilège",
          foot: "Keep this link: it gives access to your result.",
        };

  const html = `
  <div style="background:${C.ink};padding:32px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:${C.porcelain}">
    <div style="max-width:480px;margin:0 auto">
      <div style="font-size:12px;letter-spacing:.16em;color:${C.brass};text-transform:uppercase">OPTIMUP · FLORILÈGE</div>
      <h1 style="font-family:Georgia,serif;font-weight:400;font-size:30px;margin:14px 0 20px">${t.hi}</h1>
      <p style="font-size:15px;line-height:1.6;color:${C.porcelain}">${t.body}</p>
      <p style="margin:28px 0">
        <a href="${url}" style="background:${C.brass};color:${C.ink};text-decoration:none;padding:13px 26px;border-radius:999px;font-weight:600;font-size:15px">${t.cta}</a>
      </p>
      <p style="font-size:12px;color:${C.muted};line-height:1.6">${t.foot}<br>${url}</p>
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: t.subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
