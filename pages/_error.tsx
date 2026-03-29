import type { NextPageContext } from "next";

type ErrorPageProps = {
  statusCode: number;
};

/**
 * Pages Router compatibility error page.
 * Prevents build/runtime issues when Next resolves /_error internally.
 */
export default function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-geist-sans), sans-serif",
        padding: "24px",
        textAlign: "center",
        background: "var(--black)",
        color: "var(--text-primary)",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "20px",
          background: "var(--black-900)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 0 20px rgba(59,130,246,0.25)",
        }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>
          {statusCode ? `Error ${statusCode}` : "Application error"}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>An unexpected error occurred.</p>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};
