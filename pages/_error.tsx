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
        fontFamily: "system-ui, sans-serif",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>
          {statusCode ? `Error ${statusCode}` : "Application error"}
        </h1>
        <p style={{ color: "#666" }}>An unexpected error occurred.</p>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

