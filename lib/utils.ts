export function collapseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function phoneHref(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  return `tel:${hasPlus ? "+" : ""}${digitsOnly(trimmed)}`;
}

export function initials(firstName: string, surname: string): string {
  const first = firstName.trim().charAt(0);
  const last = surname.trim().charAt(0);
  return `${first}${last}`.toUpperCase();
}

export function slugifyName(firstName: string, surname: string): string {
  return `${firstName} ${surname}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return request.headers.get("x-real-ip")?.slice(0, 64) || "unknown";
}

export function jsonResponse(
  body: unknown,
  status = 200,
  headers?: HeadersInit,
): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...Object.fromEntries(new Headers(headers).entries()),
    },
  });
}
