// lib/tokens.ts — génération de jetons non devinables (plomberie app).

/** Jeton url-safe pour un lien répondant / un sujet. */
export function newToken(): string {
  // randomUUID : disponible côté serveur Node et Edge.
  return globalThis.crypto.randomUUID().replace(/-/g, "");
}
