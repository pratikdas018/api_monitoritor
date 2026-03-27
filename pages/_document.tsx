import { Head, Html, Main, NextScript } from "next/document";

/**
 * Pages Router compatibility document.
 * Keeps Next.js from failing when it resolves /_document while App Router is active.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

