import type { Metadata } from "next";
import { Code2, Flag, Gauge, Radar } from "lucide-react";

import { InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "About | API Monitor",
  description: "Learn what API Monitor is, its mission, key features, and developer information.",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Platform"
      title="About API Monitor"
      description="API Monitor is a dark-theme SaaS dashboard for tracking uptime, incidents, performance, and API health in real time."
    >
      <InfoSection icon={Radar} title="What API Monitor Is">
        A developer-focused monitoring platform that turns endpoint checks into clear uptime,
        latency, incident, and system-health views.
      </InfoSection>
      <InfoSection icon={Flag} title="Mission">
        Help teams identify failures quickly, understand service health clearly, and respond to
        API incidents with confidence.
      </InfoSection>
      <InfoSection icon={Gauge} title="Key Features">
        Real-time monitoring, uptime tracking, incident timelines, response-time analytics,
        status pages, and alert-channel settings.
      </InfoSection>
      <InfoSection icon={Code2} title="Developer Information">
        Developed by Pratik in Kolkata, India. Portfolio: pratik-web.vercel.app.
      </InfoSection>
    </InfoPage>
  );
}
