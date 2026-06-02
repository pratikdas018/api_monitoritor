import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageSquare } from "lucide-react";

import { InfoPage, InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Contact Us | API Monitor",
  description: "Contact API Monitor support for platform questions and monitoring help.",
};

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Contact"
      title="Contact Us"
      description="Reach the API Monitor team for support, feedback, platform questions, or incident-monitoring help."
    >
      <section className="glass-card rounded-xl border p-5 md:col-span-2">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-card border border-border-accent bg-accent/10 text-accent-bright">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="w-full">
            <h2 className="text-lg font-semibold text-text-primary">Contact Form</h2>
            <form className="mt-4 grid gap-3 md:grid-cols-2">
              <input aria-label="Name" placeholder="Name" className="px-3 py-2" />
              <input aria-label="Email" type="email" placeholder="Email" className="px-3 py-2" />
              <input
                aria-label="Subject"
                placeholder="Subject"
                className="px-3 py-2 md:col-span-2"
              />
              <textarea
                aria-label="Message"
                placeholder="Message"
                rows={5}
                className="px-3 py-2 md:col-span-2"
              />
              <button type="button" className="btn-primary px-4 py-2 md:w-fit">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
      <InfoSection icon={Mail} title="Email Address">
        support@apimonitor.com
      </InfoSection>
      <InfoSection icon={MapPin} title="Location">
        Kolkata, India
      </InfoSection>
      <InfoSection icon={Clock} title="Response Time Information">
        Support requests are typically reviewed within 24 business hours, with urgent incident
        visibility issues prioritized first.
      </InfoSection>
    </InfoPage>
  );
}
