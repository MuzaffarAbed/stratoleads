"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminCardTable } from "@/components/admin/AdminCardTable";
import {
  BusinessCardEditor,
  emptyEditorValues,
  valuesFromCard,
  type EditorValues,
} from "@/components/admin/BusinessCardEditor";
import { SignInForm } from "@/components/admin/SignInForm";
import { QrCodePanel } from "@/components/business-cards/QrCodePanel";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { cardUrl } from "@/lib/site";
import type { BusinessCard, BusinessCardInput } from "@/types/business-card";

type ApiResult = {
  ok?: boolean;
  message?: string;
  cards?: BusinessCard[];
  card?: BusinessCard;
  fieldErrors?: Record<string, string>;
  authenticated?: boolean;
};

export function AdminManager() {
  const [auth, setAuth] = useState<"loading" | "signed-out" | "signed-in">("loading");
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; values: EditorValues; id?: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [deactivateTarget, setDeactivateTarget] = useState<BusinessCard | null>(null);
  const [qrTarget, setQrTarget] = useState<BusinessCard | null>(null);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/business-cards", { cache: "no-store" });
      const result = (await response.json()) as ApiResult;
      if (response.status === 401) {
        setAuth("signed-out");
        return;
      }
      if (!response.ok || !result.ok || !result.cards) {
        setLoadError(result.message || "Business cards could not be loaded.");
        return;
      }
      setCards(result.cards);
    } catch {
      setLoadError("Business cards could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const result = (await response.json()) as ApiResult;
        if (result.authenticated) {
          setAuth("signed-in");
          await loadCards();
        } else {
          setAuth("signed-out");
        }
      } catch {
        setAuth("signed-out");
      }
    })();
  }, [loadCards]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return cards;
    return cards.filter((card) =>
      `${card.firstName} ${card.surname} ${card.jobTitle} ${card.slug}`.toLowerCase().includes(needle),
    );
  }, [cards, query]);

  async function save(values: BusinessCardInput) {
    if (!editor || pending) return;
    setPending(true);
    setFormError("");
    setFieldErrors({});
    try {
      const response = await fetch(editor.id ? `/api/business-cards/${editor.id}` : "/api/business-cards", {
        method: editor.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as ApiResult;
      if (response.status === 401) {
        setAuth("signed-out");
        return;
      }
      if (!response.ok || !result.ok) {
        setFieldErrors(result.fieldErrors || {});
        setFormError(result.message || "The business card could not be saved.");
        return;
      }
      setEditor(null);
      setNotice("Card saved.");
      await loadCards();
    } catch {
      setFormError("The business card could not be saved.");
    } finally {
      setPending(false);
    }
  }

  async function saveExisting(card: BusinessCard, isActive: boolean) {
    setNotice("");
    const values: BusinessCardInput = {
      firstName: card.firstName,
      surname: card.surname,
      jobTitle: card.jobTitle,
      companyName: card.companyName,
      workEmail: card.workEmail,
      mobilePhone: card.mobilePhone,
      officePhone: card.officePhone,
      website: card.website,
      linkedInUrl: card.linkedInUrl,
      location: card.location,
      profileImageUrl: card.profileImageUrl,
      slug: card.slug,
      isActive,
    };
    const response = await fetch(`/api/business-cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = (await response.json()) as ApiResult;
    if (!response.ok || !result.ok) {
      setLoadError(result.message || "The business card could not be updated.");
      return;
    }
    setNotice("Card activated.");
    await loadCards();
  }

  async function deactivate() {
    if (!deactivateTarget) return;
    const target = deactivateTarget;
    setDeactivateTarget(null);
    setNotice("");
    const response = await fetch(`/api/business-cards/${target.id}`, { method: "DELETE" });
    const result = (await response.json()) as ApiResult;
    if (!response.ok || !result.ok) {
      setLoadError(result.message || "The business card could not be deactivated.");
      return;
    }
    setNotice("Card deactivated.");
    await loadCards();
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuth("signed-out");
    setCards([]);
    setEditor(null);
  }

  if (auth === "loading") return <LoadingState label="Checking administrator session" />;
  if (auth === "signed-out") {
    return (
      <SignInForm
        onSuccess={() => {
          setAuth("signed-in");
          void loadCards();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-[-0.03em] text-ink">Business cards</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Create and publish staff cards. Only active cards appear on the public directory.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="h-11 rounded-full bg-teal px-5 text-sm font-medium text-ink hover:bg-teal-dark"
            onClick={() => {
              setEditor({ mode: "create", values: emptyEditorValues });
              setFormError("");
              setFieldErrors({});
            }}
          >
            New card
          </button>
          <button type="button" className="glass h-11 rounded-full px-4 text-sm" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </div>

      {notice ? <p className="mt-4 text-sm text-success">{notice}</p> : null}
      {loadError ? (
        <div className="mt-4">
          <ErrorState title="Cards could not be loaded" body={loadError} />
        </div>
      ) : null}

      {editor ? (
        <div className="mt-6">
          <BusinessCardEditor
            key={`${editor.mode}-${editor.id || "new"}`}
            initial={editor.values}
            mode={editor.mode}
            pending={pending}
            serverErrors={fieldErrors}
            formError={formError}
            onCancel={() => setEditor(null)}
            onSubmit={(values) => void save(values)}
          />
        </div>
      ) : (
        <div className="mt-6">
          <label htmlFor="card-search" className="mb-2 block text-sm font-medium">
            Search
          </label>
          <input
            id="card-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mb-4 h-12 w-full max-w-md rounded-2xl border border-white/80 bg-white/55 px-3 backdrop-blur-md"
            placeholder="Name, role, or slug"
          />
          {loading ? <LoadingState label="Loading cards" /> : (
            <AdminCardTable
              cards={visible}
              onEdit={(card) => {
                setEditor({ mode: "edit", id: card.id, values: valuesFromCard(card) });
                setFormError("");
                setFieldErrors({});
              }}
              onDeactivate={setDeactivateTarget}
              onActivate={(card) => void saveExisting(card, true)}
              onCopy={(card) => {
                void navigator.clipboard.writeText(cardUrl(card.slug));
                setNotice("Public link copied.");
              }}
              onQr={setQrTarget}
            />
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        title="Deactivate this card?"
        body={
          deactivateTarget
            ? `${deactivateTarget.firstName} ${deactivateTarget.surname} will disappear from the public directory. The record is kept and can be edited later.`
            : ""
        }
        confirmLabel="Deactivate"
        onCancel={() => setDeactivateTarget(null)}
        onConfirm={() => void deactivate()}
      />

      {qrTarget ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
          <div className="glass w-full max-w-sm rounded-3xl p-6" role="dialog" aria-modal="true" aria-labelledby="qr-title">
            <h2 id="qr-title" className="text-lg font-semibold text-navy">
              {qrTarget.firstName} {qrTarget.surname}
            </h2>
            <p className="mt-1 break-all text-xs text-muted">{cardUrl(qrTarget.slug)}</p>
            <div className="mt-4">
              <QrCodePanel
                dataUrl={`/api/admin/qr?slug=${encodeURIComponent(qrTarget.slug)}`}
                downloadHref={`/api/admin/qr?slug=${encodeURIComponent(qrTarget.slug)}`}
              />
            </div>
            <button type="button" className="mt-4 h-11 w-full rounded-md border border-line text-sm" onClick={() => setQrTarget(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
