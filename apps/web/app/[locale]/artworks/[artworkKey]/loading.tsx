import styles from "@/src/components/chat-prototype.module.css";

export default function ArtworkLoading() {
  return (
    <main
      aria-label="正在打开作品对话 / Opening artwork conversation"
      className={styles.loadingPage}
    >
      <section aria-hidden="true" className={styles.loadingArtwork} />
      <section className={styles.loadingConversation}>
        <span className={styles.loadingEyebrow}>CANVIUM · ARTWORK CONVERSATION</span>
        <div aria-hidden="true" className={styles.loadingLines}>
          <i />
          <i />
          <i />
        </div>
        <p>正在打开作品与对话</p>
        <small>OPENING ARTWORK AND CONVERSATION</small>
      </section>
    </main>
  );
}
