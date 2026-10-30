
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  FileCheck2,
  Globe2,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalSection from "@/components/legal/LegalSection";
import LegalContact from "@/components/legal/LegalContact";
import { legalConfig } from "@/configs/legal.config";

export const metadata: Metadata = {
  title: "Data Deletion | CivicPulse",
  description:
    "Learn how to disconnect Facebook and request deletion of personal information and Facebook-related data held by CivicPulse.",
  robots: {
    index: true,
    follow: true,
  },
};

const contactEmail = legalConfig.contact.privacyEmail;

const steps = [
  {
    number: "01",
    title: "Contact our privacy team",
    description:
      "Email us from an address you can access. Tell us that you want your CivicPulse data deleted and identify the account or Facebook Page connection concerned.",
    icon: Mail,
  },
  {
    number: "02",
    title: "Verify your request",
    description:
      "We may ask for reasonable information to confirm that you control the relevant account or are authorized to make the request. Do not send your Facebook password or access token.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Review and process deletion",
    description:
      "We review the request and delete the applicable information from our systems, subject to applicable legal obligations and any necessary retention exceptions.",
    icon: Trash2,
  },
  {
    number: "04",
    title: "Receive confirmation",
    description:
      "We will communicate the outcome using the contact details provided, including any relevant limitations or additional steps where applicable.",
    icon: FileCheck2,
  },
];

const quickInformation = [
  {
    icon: Mail,
    title: "Simple request",
    description:
      "Contact our privacy team without signing in to this page.",
  },
  {
    icon: ShieldCheck,
    title: "Identity protection",
    description:
      "We may verify your identity before disclosing or deleting data.",
  },
  {
    icon: Clock3,
    title: "Clear communication",
    description:
      "We will explain the outcome and any applicable limitations.",
  },
];

const navigationSections = [
  { id: "process", title: "Deletion process" },
  { id: "facebook", title: "Disconnect Facebook" },
  { id: "data", title: "What happens to your data?" },
  { id: "contact", title: "Submit a request" },
];

export default function DataDeletionPage() {
  const subject = encodeURIComponent("CivicPulse data deletion request");

  const body = encodeURIComponent(
    [
      "Hello CivicPulse Privacy Team,",
      "",
      "I would like to request deletion of my CivicPulse personal information and applicable Facebook-related data.",
      "",
      "CivicPulse account email or identifier:",
      "Facebook Page name (if applicable):",
      "Additional details (optional):",
      "",
      "I understand that CivicPulse may need to verify my identity before processing this request.",
      "",
      "Thank you.",
    ].join("\n")
  );

  const requestHref = `mailto:${contactEmail}?subject=${subject}&body=${body}`;

  return (
    <LegalPageLayout
      eyebrow="DATA RIGHTS AND ACCOUNTABILITY"
      title="Your information. Your choice."
      description="You can request deletion of applicable personal information and Facebook-related data held by CivicPulse. Follow the steps below to submit a request."
      sections={navigationSections}
      contactEmail={contactEmail}
      signInHref={legalConfig.brand.signInHref}
      trustMessage="CivicPulse respects your data rights and provides a clear process for requesting the deletion of applicable personal information."
      heroActions={[
        {
          label: "Request data deletion",
          href: requestHref,
          variant: "primary",
        },
        {
          label: "Read privacy policy",
          href: legalConfig.routes.privacy,
          variant: "secondary",
        },
      ]}
    >
      {/* Quick information */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickInformation.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <Icon className="size-5" />
              </div>

              <h2 className="mt-4 font-bold text-slate-900">
                {item.title}
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>

      {/* Deletion process */}
      <LegalSection
        id="process"
        number="01"
        title="How to request deletion"
        icon={Trash2}
        description="Follow these steps to submit and complete a data deletion request."
      >
        <p>
          You do not need to log in to read these instructions. Use the
          contact option below to submit your request.
        </p>

        <div className="mt-8 space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className="relative flex gap-5">
                {index !== steps.length - 1 && (
                  <div className="absolute bottom-0 left-5 top-12 w-px bg-slate-200" />
                )}

                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <Icon className="size-5" />
                </div>

                <div className="flex-1 pb-2">
                  <p className="text-xs font-bold tracking-widest text-indigo-600">
                    STEP {step.number}
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
          <h3 className="font-semibold text-slate-900">
            What should you include?
          </h3>

          <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
            <li className="flex gap-2">
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-indigo-700" />
              <span>
                The email address or identifier associated with your
                CivicPulse account.
              </span>
            </li>

            <li className="flex gap-2">
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-indigo-700" />
              <span>
                The Facebook Page name, if your request concerns a
                connected Page.
              </span>
            </li>

            <li className="flex gap-2">
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-indigo-700" />
              <span>
                A clear statement that you want your applicable data
                deleted.
              </span>
            </li>
          </ul>
        </div>
      </LegalSection>

      {/* Facebook disconnection */}
      <LegalSection
        id="facebook"
        number="02"
        title="Disconnect Facebook"
        icon={Globe2}
        description="You can revoke CivicPulse access to your Facebook account through Facebook settings."
      >
        <p>
          You can remove CivicPulse&apos;s access through Facebook&apos;s
          settings for connected apps and websites. The exact menu may
          vary by Facebook version.
        </p>

        <a
          href="https://www.facebook.com/settings?tab=applications"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-900"
        >
          Open Facebook app settings
          <ArrowRight className="size-4" />
        </a>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm leading-7 text-amber-900">
            Removing Facebook access does not necessarily delete
            information already stored by CivicPulse. Submit a separate
            deletion request if you also want applicable stored data
            deleted.
          </p>
        </div>
      </LegalSection>

      {/* Data handling */}
      <LegalSection
        id="data"
        number="03"
        title="What happens to your data?"
        icon={Database}
        description="We review the information covered by your request and apply relevant deletion and retention requirements."
      >
        <p>
          Your request will be reviewed to determine which account
          information, connected Page data, comments, analytical records,
          and other applicable information are covered.
        </p>

        <p>
          Information subject to a valid deletion request will be handled
          in accordance with our privacy policy and applicable retention
          requirements. Any data that must be retained for a lawful
          reason will be handled accordingly.
        </p>

        <Link
          href={legalConfig.routes.privacy}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-900"
        >
          Read our privacy policy
          <ArrowRight className="size-4" />
        </Link>
      </LegalSection>

      {/* Contact */}
      <div id="contact" className="scroll-mt-28">
        <LegalContact
          eyebrow="DATA DELETION REQUEST"
          title="Ready to submit your request?"
          description="Email our privacy team. Include enough information to identify the relevant account, but never include your Facebook password or access token."
          email={contactEmail}
          buttonLabel="Request data deletion"
          icon={Mail}
        />

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-indigo-600" />

          <p className="text-sm leading-6 text-slate-600">
            For your security, CivicPulse will never ask you to send
            your Facebook password or access token by email.
          </p>
        </div>
      </div>
    </LegalPageLayout>
  );
}
