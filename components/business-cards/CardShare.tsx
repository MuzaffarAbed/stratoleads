"use client";

import { useState } from "react";

import { ActionIcon } from "@/components/business-cards/ActionIcon";
import { cardUrl } from "@/lib/site";

const iconButtonClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-teal-deep hover:bg-teal-light disabled:opacity-50";

export function CardShare({ slug, disabled = false }: { slug: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = cardUrl(slug);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "STRATO IT Group", url });
        return;
      } catch {
        return;
      }
    }
    await copy();
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <button
        type="button"
        className={iconButtonClass}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Link copied" : "Copy link"}
        onClick={() => void copy()}
        disabled={disabled || !slug}
      >
        <ActionIcon name={copied ? "check" : "copy"} />
      </button>
      <button
        type="button"
        className={iconButtonClass}
        aria-label="Share"
        title="Share"
        onClick={() => void share()}
        disabled={disabled || !slug}
      >
        <ActionIcon name="share" />
      </button>
      <p className="sr-only" aria-live="polite">
        {copied ? "Link copied" : ""}
      </p>
    </div>
  );
}
