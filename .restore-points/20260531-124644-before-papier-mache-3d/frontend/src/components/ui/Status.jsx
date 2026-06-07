export function LoadingState({ label = "Loading" }) {
  return <div className="status-panel">{label}</div>;
}

export function ErrorState({ error }) {
  return (
    <div className="status-panel status-error">
      {error?.message || "Something went wrong"}
    </div>
  );
}

export function EmptyState({ label = "Nothing to show yet" }) {
  return <div className="status-panel">{label}</div>;
}
