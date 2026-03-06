import { ArchitectureSection } from "@/components/landing/ArchitectureSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { DashboardPreviewSection } from "@/components/landing/DashboardPreviewSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PlatformOverviewSection } from "@/components/landing/PlatformOverviewSection";
import { StatusPreviewSection } from "@/components/landing/StatusPreviewSection";

export default function LandingPage() {
  return (
    <main className="mx-auto w-full max-w-[1300px] space-y-14 px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:py-10">
      <HeroSection />
      <PlatformOverviewSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <ArchitectureSection />
      <StatusPreviewSection />
      <CtaSection />
    </main>
  );
}
