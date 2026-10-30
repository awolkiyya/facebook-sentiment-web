
import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";

import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalSection from "@/components/legal/LegalSection";
import LegalContact from "@/components/legal/LegalContact";
import { legalConfig } from "@/configs/legal.config";

export const metadata: Metadata = {
  title: "Privacy Policy | CivicPulse",
  description:
    "Learn how CivicPulse collects, processes, stores, and protects information when you connect your Facebook Pages for social media analytics.",
  robots: {
    index: true,
    follow: true,
  },
};

const lastUpdated = "October 28, 2026";

const contactEmail = legalConfig.contact.privacyEmail;

const sections = [
  {
    id: "information",
    number: "01",
    title: "Information We Process",
    icon: Database,
    content: [
      {
        heading: "Account information",
        text: "We may process your name, email address, account identifier, and other basic information made available through your chosen sign-in method.",
      },
      {
        heading: "Facebook Page information",
        text: "When you authorize access, CivicPulse may retrieve eligible Facebook Page information, posts, comments, reactions, engagement metrics, and Page insights permitted by your granted permissions.",
      },
      {
        heading: "Technical information",
        text: "We may process security logs, timestamps, browser information, and technical request metadata to operate, troubleshoot, and protect the service.",
      },
    ],
  },
  {
    id: "usage",
    number: "02",
    title: "How We Use Information",
    icon: BrainCircuit,
    content: [
      {
        heading: "Social media analytics",
        text: "We use authorized Page data to present relevant content, engagement measurements, and performance reports.",
      },
      {
        heading: "AI-assisted analysis",
        text: "Where enabled, eligible comments may be processed to classify sentiment, language, and topics and to generate analytical summaries.",
      },
      {
        heading: "Service operation",
        text: "Information may be used to authenticate users, synchronize connected Pages, troubleshoot failures, enforce security, and improve service reliability.",
      },
    ],
  },
  {
    id: "sharing",
    number: "03",
    title: "Sharing and Service Providers",
    icon: Users,
    content: [
      {
        heading: "Infrastructure providers",
        text: "Information may be processed by hosting, database, and infrastructure providers that support CivicPulse.",
      },
      {
        heading: "AI processing",
        text: "Where applicable, relevant content may be sent to our sentiment-analysis service to perform the requested analysis.",
      },
      {
        heading: "Legal and security requirements",
        text: "We may disclose information when required by applicable law or when reasonably necessary to protect users, the service, or other parties.",
      },
    ],
  },
  {
    id: "retention",
    number: "04",
    title: "Storage and Retention",
    icon: Database,
    content: [
      {
        heading: "Retention periods",
        text: "We retain information only for as long as needed for the purposes described in this policy, subject to applicable legal obligations and legitimate operational requirements.",
      },
      {
        heading: "Access controls",
        text: "We use appropriate technical and organizational safeguards intended to protect information against unauthorized access, alteration, loss, or disclosure.",
      },
      {
        heading: "Deletion",
        text: "When an eligible deletion request is verified, we take steps to delete the applicable information from our systems, subject to legal obligations and any necessary, documented retention exceptions.",
      },
    ],
  },
];

const navigation = [
  { id: "information", title: "Information we process" },
  { id: "usage", title: "How we use information" },
  { id: "sharing", title: "Sharing and providers" },
  { id: "retention", title: "Storage and retention" },
  { id: "facebook", title: "Facebook and Meta" },
  { id: "rights", title: "Your choices and rights" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact us" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="PRIVACY AND TRANSPARENCY"
      title="Your data. Your trust. Our responsibility."
      description="This policy explains how CivicPulse handles information when you connect Facebook Pages and use our social media analytics and AI-assisted insights."
      updatedAt={lastUpdated}
      sections={navigation}
      contactEmail={contactEmail}
      signInHref={legalConfig.brand.signInHref}
      trustMessage="Adama City Social Intelligence is committed to transparent data practices and responsible use of social media analytics."
      heroActions={[
        {
          label: "Data Deletion",
          href: legalConfig.routes.dataDeletion,
        },
        {
          label: "Terms of Service",
          href: legalConfig.routes.terms,
          variant: "secondary",
        },
      ]}
    >
      {/* Introduction */}
      <section className="mb-10">
        <div className="space-y-5">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 text-primary">
            <FileText className="size-6" aria-hidden="true" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            About this policy
          </h2>

          <p className="leading-8 text-muted-foreground">
            CivicPulse is a social media analytics platform that helps
            authorized users understand social media conversations through
            engagement reporting and sentiment analysis. This policy applies
            to information processed through our website, account
            authentication, connected Facebook Pages, and related analytics
            features.
          </p>

          <p className="leading-8 text-muted-foreground">
            By using CivicPulse, you acknowledge that you have had the
            opportunity to read this policy. Where consent or another legal
            basis is required, we will handle information in accordance with
            applicable requirements.
          </p>

          {/* Transparency notice */}
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-1 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />

              <div>
                <h3 className="font-semibold text-foreground">
                  Transparency matters
                </h3>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  We aim to collect and process only information relevant to
                  operating the features you use and the permissions you
                  grant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Information we process, usage, sharing and retention */}
      <div>
        {sections.map((section) => (
          <LegalSection
            key={section.id}
            id={section.id}
            number={section.number}
            title={section.title}
            icon={section.icon}
          >
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {section.content.map((item) => (
                <div key={item.heading}>
                  <h3 className="font-semibold text-foreground">
                    {item.heading}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </LegalSection>
        ))}
      </div>

      {/* Facebook and Meta */}
      <LegalSection
        id="facebook"
        number="05"
        title="Facebook and Meta"
        icon={Users}
      >
        <p>
          When you connect a Facebook account or Page, CivicPulse accesses
          information made available through Meta&apos;s authorization and
          API systems. Access depends on your authorization, the permissions
          granted to the application, and Meta&apos;s applicable policies and
          restrictions.
        </p>

        <p>
          Your use of Facebook remains subject to Meta&apos;s applicable
          terms and privacy policies. Disconnecting Facebook access prevents
          future access where the authorization has been revoked, but it does
          not automatically guarantee that previously stored CivicPulse data
          has been deleted.
        </p>

        <a
          href="https://www.facebook.com/privacy/policy/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 transition-colors hover:underline"
        >
          Read Meta&apos;s Privacy Policy
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </LegalSection>

      {/* User rights */}
      <LegalSection
        id="rights"
        number="06"
        title="Your Choices and Rights"
        icon={CheckCircle2}
      >
        <p>
          Depending on applicable law, you may have rights to request access
          to, correction of, or deletion of your personal information, object
          to certain processing, or withdraw consent where consent is the
          relevant legal basis.
        </p>

        <p>
          You can also disconnect a Facebook Page through the applicable
          account or connection controls. To request deletion of information
          held by CivicPulse, visit our dedicated instructions page.
        </p>

        <Link
  href={legalConfig.routes.dataDeletion}
  className="relative z-10 mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold !text-primary-foreground opacity-100 transition-colors hover:bg-primary/90"
>
  <span>View data deletion instructions</span>
  <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
</Link>
      </LegalSection>

      {/* Policy changes */}
      <LegalSection
        id="changes"
        number="07"
        title="Changes to This Policy"
        icon={FileText}
      >
        <p>
          We may update this policy when our services, data practices,
          or legal obligations change. The updated version will be
          published on this page with a revised update date.
        </p>
      </LegalSection>

      {/* Contact */}
      <section id="contact" className="scroll-mt-28 pt-9">
        <LegalContact
          eyebrow="PRIVACY SUPPORT"
          title="Questions about privacy?"
          description="Contact us with questions about this policy, your information, or a privacy-related request."
          email={contactEmail}
          buttonLabel="Contact privacy team"
        />
      </section>
    </LegalPageLayout>
  );
}
