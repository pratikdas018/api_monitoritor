import type { Metadata } from "next";
import {
  Activity,
  Bell,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  Siren,
} from "lucide-react";

import { InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Features | API Monitor",
  description: "API Monitor features for real-time monitoring, uptime, incidents, analytics, dashboards, and alerts.",
};

export default function FeaturesPage() {
  return (
    <InfoPage
      eyebrow="Capabilities"
      title="Features"
      description="Everything needed to track API reliability, understand health trends, and react quickly when services degrade."
    >
      <InfoSection icon={Activity} title="Real-time Monitoring">
        Continuously check APIs and surface current operational state across the dashboard.
      </InfoSection>
      <InfoSection icon={HeartPulse} title="Uptime Tracking">
        Measure service availability with historical checks and monitor-level uptime summaries.
      </InfoSection>
      <InfoSection icon={Siren} title="Incident Management">
        Track open and resolved incidents with failure counts, timestamps, and recovery context.
      </InfoSection>
      <InfoSection icon={Gauge} title="Response Time Analytics">
        Review latency trends, average response time, and performance behavior over time.
      </InfoSection>
      <InfoSection icon={LayoutDashboard} title="API Health Dashboard">
        Manage monitors, projects, status signals, regional views, and recent activity from one place.
      </InfoSection>
      <InfoSection icon={Bell} title="Alert System">
        Configure alert channels so teams can react when checks fail or services recover.
      </InfoSection>
    </InfoPage>
  );
}
