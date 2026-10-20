export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-3xl border-dashed px-5 py-10 text-center">
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
