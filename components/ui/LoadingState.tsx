export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-10 text-sm text-muted" role="status">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-navy motion-reduce:animate-none"
      />
      {label}
    </div>
  );
}
