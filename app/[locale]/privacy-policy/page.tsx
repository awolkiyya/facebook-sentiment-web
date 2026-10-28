
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";

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
const contactEmail = "privacy@yourdomain.com"; // Replace before publishing

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
  { href: "#information", label: "Information we process" },
  { href: "#usage", label: "How we use information" },
  { href: "#sharing", label: "Sharing and providers" },
  { href: "#retention", label: "Storage and retention" },
  { href: "#facebook", label: "Facebook and Meta" },
  { href: "#rights", label: "Your choices and rights" },
  { href: "#contact", label: "Contact us" },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight">
                CivicPulse
              </span>
              <span className="block text-xs text-slate-500">
                Social intelligence
              </span>
            </div>
          </Link>

          <Link
            href="/data-deletion"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            Data deletion
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 size-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-indigo-200">
            <LockKeyhole className="size-4" />
            Privacy and transparency
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Your data.
            <br />
            Your trust.
            <br />
            <span className="text-indigo-300">Our responsibility.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            This policy explains how CivicPulse handles information when you
            connect Facebook Pages and use our social media analytics and
            AI-assisted insights.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/15 px-3 py-1.5">
              Effective and updated: {lastUpdated}
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1.5">
              Public privacy notice
            </span>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_300px] lg:py-16">
        <div className="space-y-5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <FileText className="size-6" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            About this policy
          </h2>

          <p className="leading-8 text-slate-600">
            CivicPulse is a social media analytics platform that helps
            authorized users understand social media conversations through
            engagement reporting and sentiment analysis. This policy applies
            to information processed through our website, account
            authentication, connected Facebook Pages, and related analytics
            features.
          </p>

          <p className="leading-8 text-slate-600">
            By using CivicPulse, you acknowledge that you have had the
            opportunity to read this policy. Where consent or another legal
            basis is required, we will handle information in accordance with
            applicable requirements.
          </p>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 size-5 shrink-0 text-indigo-700" />
              <div>
                <h3 className="font-semibold text-slate-900">
                  Transparency matters
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  We aim to collect and process only information relevant to
                  operating the features you use and the permissions you grant.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table of contents */}
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            On this page
          </h2>
          <nav className="mt-4 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
      </section>

      {/* Policy sections */}
      <section className="mx-auto max-w-7xl space-y-5 px-5 pb-12 sm:px-8">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <article
              key={section.id}
              id={section.id}
              className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest text-indigo-600">
                    {section.number}
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                    {section.title}
                  </h2>
                </div>
              </div>

              <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {section.content.map((item) => (
                  <div key={item.heading}>
                    <h3 className="font-semibold text-slate-900">
                      {item.heading}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}

        <article
          id="facebook"
          className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Users className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Facebook and Meta
              </h2>
              <p className="mt-4 leading-8 text-slate-600">
                When you connect a Facebook account or Page, CivicPulse
                accesses information made available through Meta's
                authorization and API systems. Access depends on your
                authorization, the permissions granted to the application,
                and Meta's applicable policies and restrictions.
              </p>
              <p className="mt-4 leading-8 text-slate-600">
                Your use of Facebook remains subject to Meta's applicable
                terms and privacy policies. Disconnecting Facebook access
                prevents future access where the authorization has been
                revoked, but it does not automatically guarantee that
                previously stored CivicPulse data has been deleted.
              </p>
              <p className="mt-4">
                <a
                  href="https://www.facebook.com/privacy/policy/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  Read Meta's Privacy Policy
                  <ArrowUpRight className="size-4" />
                </a>
              </p>
            </div>
          </div>
        </article>

        <article
          id="rights"
          className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold sm:text-2xl">
                Your choices and rights
              </h2>
              <p className="mt-4 leading-8 text-slate-600">
                Depending on applicable law, you may have rights to request
                access to, correction of, or deletion of your personal
                information, object to certain processing, or withdraw
                consent where consent is the relevant legal basis.
              </p>
              <p className="mt-4 leading-8 text-slate-600">
                You can also disconnect a Facebook Page through the
                applicable account or connection controls. To request
                deletion of information held by CivicPulse, visit our
                dedicated instructions page.
              </p>
              <Link
                href="/data-deletion"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                View data deletion instructions
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold sm:text-2xl">
            Changes to this policy
          </h2>
          <p className="mt-4 leading-8 text-slate-600">
            We may update this policy when our services, data practices,
            or legal obligations change. The updated version will be
            published on this page with a revised update date.
          </p>
        </article>

        <article
          id="contact"
          className="scroll-mt-8 rounded-2xl bg-slate-950 p-6 text-white sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Mail className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Questions about privacy?
              </h2>
              <p className="mt-3 leading-7 text-slate-300">
                Contact us with questions about this policy, your
                information, or a privacy-related request.
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className="mt-4 inline-flex items-center gap-2 font-semibold text-indigo-300 hover:text-white"
              >
                {contactEmail}
                <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </article>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} CivicPulse. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link
              href="/privacy-policy"
              className="font-medium text-slate-700 hover:text-indigo-700"
            >
              Privacy Policy
            </Link>
            <Link
              href="/data-deletion"
              className="font-medium text-slate-700 hover:text-indigo-700"
            >
              Data Deletion
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
