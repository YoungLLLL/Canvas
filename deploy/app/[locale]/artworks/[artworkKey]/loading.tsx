import styles from "@/src/components/chat-scroll-demo.module.css";

export default function ArtworkLoading() {
  return (
    <main
      aria-label="正在打开作品对话 / Opening artwork conversation"
      className={styles.loadingPage}
    >
      <div aria-hidden="true" className={styles.loadingArtwork} />
      <span className={styles.loadingWordmark}>Canvium</span>
      <section className={styles.chatDock} aria-hidden="true">
        <div className={styles.chatShell}>
          <div className={styles.chatSurface}>
            <div className={styles.glassGlow} />
            <div className={styles.chatHeader}>
              <div className={styles.chatTitle}>
                <svg className={styles.squareArrow} viewBox="0 0 24 24">
                  <path d="M4 20 20 4" />
                  <path d="M6 4h14v14" />
                </svg>
                <span>Talk with ...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className={styles.loadingCaption} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
    </main>
  );
}
