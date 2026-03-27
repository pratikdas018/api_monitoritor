import type { Metadata } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "API Monitor Platform",
  description:
    "Production-grade API monitoring and incident response platform built with Next.js 14.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/pratikdas018/api_monitoritor";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <AuthSessionProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar githubUrl={githubUrl} />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
