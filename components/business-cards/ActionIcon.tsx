export type ActionIconName = "call" | "email" | "office" | "website" | "linkedin" | "copy" | "share" | "check";

export function ActionIcon({ name }: { name: ActionIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
        <path d="M6.5 9H4V20h2.5V9ZM5.25 3.5A1.75 1.75 0 1 0 5.26 7a1.75 1.75 0 0 0-.01-3.5ZM20 20h-2.5v-5.6c0-1.55-.55-2.6-1.94-2.6-1.06 0-1.69.71-1.97 1.4-.1.25-.13.6-.13.95V20H11V9h2.4v1.51c.36-.55 1.16-1.34 2.83-1.34 2.07 0 3.77 1.35 3.77 4.26V20Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      {name === "call" ? (
        <path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 1h2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.1 8.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 1.9Z" />
      ) : null}
      {name === "email" ? (
        <>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </>
      ) : null}
      {name === "office" ? (
        <>
          <path d="M3.5 20.5h17" />
          <rect x="6" y="3.5" width="7.5" height="17" rx="0.5" />
          <path d="M13.5 10.5h4.5v10" />
          <path d="M8.2 7.2h2.2M8.2 10.6h2.2M8.2 14h2.2M15.4 13.4h1.4M15.4 16.6h1.4" />
        </>
      ) : null}
      {name === "website" ? (
        <>
          <circle cx="12" cy="12" r="8.25" />
          <path d="M3.75 12h16.5M12 3.75c2.1 2.3 3.2 5.1 3.2 8.25s-1.1 5.95-3.2 8.25c-2.1-2.3-3.2-5.1-3.2-8.25s1.1-5.95 3.2-8.25Z" />
        </>
      ) : null}
      {name === "copy" ? (
        <>
          <path d="M10 13a4 4 0 0 0 6 0l2-2a4 4 0 0 0-5.7-5.6L11 6.6" />
          <path d="M14 11a4 4 0 0 0-6 0l-2 2a4 4 0 0 0 5.7 5.6L13 17.4" />
        </>
      ) : null}
      {name === "share" ? (
        <>
          <circle cx="6.5" cy="12" r="2.25" />
          <circle cx="17" cy="6.5" r="2.25" />
          <circle cx="17" cy="17.5" r="2.25" />
          <path d="m8.5 11 6.2-3.6M8.6 13.1l6.1 3.4" />
        </>
      ) : null}
      {name === "check" ? <path d="m5 12.5 4.2 4.2L19 7.5" /> : null}
    </svg>
  );
}
