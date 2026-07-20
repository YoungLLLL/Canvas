import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell page">
      <p className="eyebrow">404</p>
      <h1 className="title">This gallery room does not exist.</h1>
      <div className="actions">
        <Link className="button button-primary" href="/en">
          Return home
        </Link>
      </div>
    </main>
  );
}
