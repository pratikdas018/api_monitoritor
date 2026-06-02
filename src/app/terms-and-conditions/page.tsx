import type { Metadata } from "next";
import { AlertTriangle, ClipboardCheck, Scale, Server } from "lucide-react";

import { InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Terms & Conditions | API Monitor",
  description: "Terms covering API Monitor responsibilities, platform rules, availability, and liability.",
};

export default function TermsAndConditionsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms & Conditions"
      description="These terms describe responsible platform usage and the operational expectations for API Monitor users."
    >
      <InfoSection icon={ClipboardCheck} title="User Responsibilities">
        Users must provide accurate account information, monitor only endpoints they are authorized
        to check, and keep credentials or API keys secure.
      </InfoSection>
      <InfoSection icon={Scale} title="Platform Usage Rules">
        Do not use API Monitor for abusive traffic, unauthorized scanning, credential harvesting,
        or activity that disrupts third-party services.
      </InfoSection>
      <InfoSection icon={Server} title="Service Availability">
        We aim to keep monitoring services available, but maintenance, infrastructure incidents,
        or third-party outages may temporarily affect access.
      </InfoSection>
      <InfoSection icon={AlertTriangle} title="Liability Disclaimer">
        API Monitor provides observability tools and alerts, but users remain responsible for
        operational decisions, incident response, and endpoint reliability.
      </InfoSection>
    </InfoPage>
  );
}
