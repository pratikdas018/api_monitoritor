import type { AppProps } from "next/app";

/**
 * Pages Router compatibility entrypoint.
 * App Router handles primary rendering in this project.
 */
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

