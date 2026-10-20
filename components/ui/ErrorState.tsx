export function ErrorState({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-3xl border-danger/25 px-5 py-8" role="alert">
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
