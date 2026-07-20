export default function Loading() {
  return (
    <main className="shell page" aria-busy="true" aria-label="Loading">
      <div className="skeleton" style={{ width: 150, height: 12 }} />
      <div className="skeleton" style={{ width: "min(820px, 92%)", height: 160, marginTop: 24 }} />
      <div className="skeleton" style={{ width: "min(560px, 72%)", height: 28, marginTop: 30 }} />
    </main>
  );
}
