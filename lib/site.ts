export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return configured.replace(/\/$/, "");
}

export function cardPath(slug: string): string {
  return `/business-cards/${encodeURIComponent(slug)}`;
}

export function cardUrl(slug: string): string {
  return `${siteUrl()}${cardPath(slug)}`;
}

export function siteOrigin(): string {
  try {
    return new URL(siteUrl()).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  let actual: URL;
  try {
    actual = new URL(origin);
  } catch {
    return false;
  }

  if (actual.origin === siteOrigin()) return true;

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  return Boolean(host && actual.host === host);
}

export function usesLocalSiteUrl(): boolean {
  try {
    const host = new URL(siteUrl()).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return true;
  }
}
