import { DemoStyles } from "@/src/components/demo-styles";

export default function CollectionLoading() {
  return (
    <main
      className="view gallery-view active collection-gallery-loading"
      aria-busy="true"
      aria-label="Loading collection"
    >
      <DemoStyles />
      <div className="museum-detail-hero" aria-hidden="true">
        <div className="museum-title-block">
          <div className="skeleton loading-kicker" />
          <div className="skeleton loading-title" />
        </div>
        <div className="museum-introduction">
          <div className="skeleton loading-copy" />
          <div className="skeleton loading-copy short" />
        </div>
      </div>
      <div className="collection-marquee loading-marquee" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div className={`skeleton loading-artwork loading-artwork-${index + 1}`} key={index} />
        ))}
      </div>
      <p className="gallery-instruction">LOADING COLLECTION</p>
    </main>
  );
}
