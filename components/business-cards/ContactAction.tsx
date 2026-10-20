import { ActionIcon, type ActionIconName } from "@/components/business-cards/ActionIcon";

const iconButtonClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-teal-deep hover:bg-teal-light";

export function ContactAction({
  href,
  label,
  icon,
  external = false,
}: {
  href: string;
  label: string;
  icon: ActionIconName;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className={iconButtonClass}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <ActionIcon name={icon} />
    </a>
  );
}
