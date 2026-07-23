export function CanviumLoadingScreen({ exiting = false }: { exiting?: boolean }) {
  return (
    <div
      className={`canvium-loading-screen${exiting ? " is-exiting" : ""}`}
      aria-label="Canvium Gallery 正在加载 / Loading"
      aria-live="polite"
      role="status"
    >
      <svg
        className="canvium-curtain-shape"
        viewBox="0 0 100 122"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 0 H100 V100 Q50 122 0 100 Z" />
      </svg>
      <div className="canvium-loading-wordmark">
        <strong>CANVIUM</strong>
        <span>线上美术馆 / DIGITAL ART GALLERY</span>
      </div>
      <p>
        <span>正在准备今日作品</span>
        <small>PREPARING TODAY&apos;S ARTWORK</small>
      </p>
    </div>
  );
}
