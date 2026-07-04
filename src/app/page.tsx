import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        {/* Logo / Wordmark */}
        <h1
          className="text-6xl font-black mb-4"
          style={{ color: "#FF6B35" }}
        >
          YChecker
        </h1>

        <p className="text-xl mb-8" style={{ color: "#666666" }}>
          Find Out If Your YC Application Would Get You Rejected
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/apply"
            className="btn-primary inline-block no-underline"
          >
            Check My Application
          </Link>
          <Link
            href="/login"
            className="btn-secondary inline-block no-underline"
          >
            Sign In
          </Link>
        </div>

        <p className="mt-12 text-sm" style={{ color: "#666666" }}>
          Phase 1 — Infrastructure Setup Complete ✓
        </p>
      </div>
    </main>
  );
}
