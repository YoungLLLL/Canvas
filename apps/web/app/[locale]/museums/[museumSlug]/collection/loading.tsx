export default function CollectionLoading() {
  return (
    <main className="collection-page" aria-busy="true" aria-label="Loading collection">
      <section className="shell collection-loading-head">
        <div className="skeleton" style={{ width: 240, height: 12 }} />
        <div
          className="skeleton"
          style={{ width: "min(760px, 92%)", height: 150, marginTop: 28 }}
        />
        <div
          className="skeleton"
          style={{ width: "min(780px, 100%)", height: 48, marginTop: 50 }}
        />
      </section>
      <section className="shell artwork-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="collection-card-skeleton skeleton" key={index} />
        ))}
      </section>
    </main>
  );
}
