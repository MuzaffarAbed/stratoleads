"use client";

import { useState } from "react";

import { initials } from "@/lib/utils";

export function Avatar({
  firstName,
  surname,
  imageUrl,
  size = "md",
}: {
  firstName: string;
  surname: string;
  imageUrl?: string;
  size?: "sm" | "md";
}) {
  const [failed, setFailed] = useState(false);
  const label = initials(firstName, surname);
  const sizeClass = size === "sm" ? "h-14 w-14 text-base" : "h-20 w-20 text-lg";

  if (imageUrl && !failed) {
    return (
      // Remote profile photos are supplied per card and are not known at build time.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={`${sizeClass} rounded-full object-cover`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full bg-ink font-semibold tracking-wide text-gold ${sizeClass}`}
    >
      {label}
    </div>
  );
}
