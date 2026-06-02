import type { Metadata } from "next";
import { CircleHelp, LifeBuoy, Mail, Wrench } from "lucide-react";

import { InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Help Center | API Monitor",
  description: "Guides, FAQs, troubleshooting, and support details for API Monitor.",
};

export default function HelpCenterPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Help Center"
      description="Find practical guidance for setting up monitors, reading incidents, and keeping API health checks reliable."
    >
      <InfoSection icon={LifeBuoy} title="Introduction">
        API Monitor gives teams a focused workspace for uptime checks, response-time visibility,
        incident history, and service health reviews.
      </InfoSection>
      <InfoSection icon={CircleHelp} title="Frequently Asked Questions">
        Create monitors from the dashboard, review public status from the status page, and use
        incidents to understand when an API failed and recovered.
      </InfoSection>
      <InfoSection icon={Wrench} title="Troubleshooting Guide">
        Check endpoint URLs, authentication headers, expected status codes, MongoDB configuration,
        and recent latency logs when monitor data looks incomplete.
      </InfoSection>
      <InfoSection icon={Mail} title="Contact Support Information">
        Email support@apimonitor.com with the monitor name, affected endpoint, error message, and
        the time the issue started.
      </InfoSection>
    </InfoPage>
  );
}
