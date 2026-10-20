export function QrCodePanel({
  dataUrl,
  downloadHref,
  caption = "Scan to open this card",
}: {
  dataUrl?: string;
  downloadHref?: string;
  caption?: string;
}) {
  if (!dataUrl) {
    return (
      <p className="text-sm text-muted">A QR code appears here once the public link is valid.</p>
    );
  }

  return (
    <figure className="flex flex-col items-center gap-3">
      {/* The QR image is a generated data URL for the public card address. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="QR code for this digital business card" width={180} height={180} />
      <figcaption className="text-center text-sm text-muted">{caption}</figcaption>
      {downloadHref ? (
        <a href={downloadHref} className="text-sm font-medium text-navy underline decoration-gold underline-offset-4">
          Download QR code
        </a>
      ) : null}
    </figure>
  );
}
