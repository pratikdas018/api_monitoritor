import type { Metadata } from "next";
import { Cookie, Database, Lock, ShieldCheck } from "lucide-react";

import { InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Privacy Policy | API Monitor",
  description: "API Monitor data collection, cookies, privacy rights, and security practices.",
};

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="API Monitor is designed to collect only the operational data needed to provide reliable monitoring and incident visibility."
    >
      <InfoSection icon={Database} title="Data Collection Policy">
        We collect account details, monitor configuration, endpoint metadata, latency results,
        uptime records, and incident events required to operate the platform.
      </InfoSection>
      <InfoSection icon={Cookie} title="Cookies Usage">
        Cookies and session storage may be used for authentication, dashboard preferences, and
        secure access to protected monitoring pages.
      </InfoSection>
      <InfoSection icon={ShieldCheck} title="User Privacy Rights">
        Users can request access, correction, or deletion of personal information by contacting
        support@apimonitor.com.
      </InfoSection>
      <InfoSection icon={Lock} title="Security Information">
        API Monitor uses authentication controls, environment-based secrets, and protected routes
        to reduce unauthorized access to monitoring data.
      </InfoSection>
    </InfoPage>
  );
}
