import Link from "next/link";

import { ArchitectureSection } from "@/components/landing/ArchitectureSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { DashboardPreviewSection } from "@/components/landing/DashboardPreviewSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { StatusPreviewSection } from "@/components/landing/StatusPreviewSection";

export default function LandingPage() {
  return (
    <main className="mx-auto w-full max-w-[1300px] space-y-14 px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:py-10">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/50 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">API Monitor Platform</p>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/status" className="btn-soft">
            Status
          </Link>
          <Link href="/login" className="btn-soft">
            Login
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ArchitectureSection />
      <DashboardPreviewSection />
      <StatusPreviewSection />
      <CtaSection />
    </main>
  );
}
