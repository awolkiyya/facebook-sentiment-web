
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  Globe2,
  FileCheck2,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Data Deletion | CivicPulse",
  description:
    "Learn how to disconnect Facebook and request deletion of personal information and Facebook-related data held by CivicPulse.",
  robots: {
    index: true,
    follow: true,
  },
};

const contactEmail = "privacy@yourdomain.com"; // Replace before publishing

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

export default function DataDeletionPage() {
  const subject = encodeURIComponent("CivicPulse data deletion request");
  const body = encodeURIComponent(
    "Hello CivicPulse Privacy Team,\n\n" +
      "I would like to request deletion of my CivicPulse personal information and applicable Facebook-related data.\n\n" +
      "CivicPulse account email or identifier:\n" +
      "Facebook Page name (if applicable):\n" +
      "Additional details (optional):\n\n" +
      "I understand that CivicPulse may need to verify my identity before processing this request.\n\n" +
      "Thank you."
  );

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
            href="/privacy-policy"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            Privacy policy
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <Link
            href="/privacy-policy"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Privacy policy
          </Link>

          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Trash2 className="size-7 text-indigo-300" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Your information. Your choice.
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Data deletion
            <br />
            <span className="text-slate-300">made clear.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            You can request deletion of applicable personal information and
            Facebook-related data held by CivicPulse. Follow the steps below
            to submit a request.
          </p>
        </div>
      </section>

      {/* Quick information */}
      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:grid-cols-3 sm:px-8">
        {[
          {
            icon: Mail,
            title: "Simple request",
            text: "Contact our privacy team without signing in to this page.",
          },
          {
            icon: ShieldCheck,
            title: "Identity protection",
            text: "We may verify your identity before disclosing or deleting data.",
          },
          {
            icon: Clock3,
            title: "Clear communication",
            text: "We will explain the outcome and any applicable limitations.",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-4 font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {item.text}
              </p>
            </div>
          );
        })}
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              The process
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              How to request deletion
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              You do not need to log in to read these instructions. Use the
              contact option below to submit your request.
            </p>
          </div>

          <div className="mt-10 space-y-8">
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
                    <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
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
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-indigo-700" />
                The email address or identifier associated with your CivicPulse
                account.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-indigo-700" />
                The Facebook Page name, if your request concerns a connected
                Page.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-indigo-700" />
                A clear statement that you want your applicable data deleted.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Facebook disconnection */}
      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Globe2 className="size-5" />
            </div>
            <h2 className="mt-5 text-xl font-bold">
              Disconnect Facebook
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              You can also remove CivicPulse&apos;s access through Facebook&apos;s
              settings for connected apps and websites. The exact menu may
              vary by Facebook version.
            </p>
            <a
              href="https://www.facebook.com/settings?tab=applications"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              Open Facebook app settings
              <ArrowRight className="size-4" />
            </a>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Removing access does not necessarily delete information already
              stored by CivicPulse. Submit a separate deletion request if
              needed.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Database className="size-5" />
            </div>
            <h2 className="mt-5 text-xl font-bold">
              What happens to your data?
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Your request will be reviewed to determine which account
              information, connected Page data, comments, analytical records,
              and other applicable information are covered.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Information subject to a valid deletion request will be handled
              in accordance with our privacy policy and applicable retention
              requirements. Any data that must be retained for a lawful
              reason will be handled accordingly.
            </p>
            <Link
              href="/privacy-policy"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              Read our privacy policy
              <ArrowRight className="size-4" />
            </Link>
          </article>
        </div>
      </section>

      {/* Request CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-white/10">
                <Mail className="size-6 text-indigo-300" />
              </div>
              <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
                Ready to submit your request?
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Email our privacy team. Include enough information to identify
                the relevant account, but never include your Facebook
                password or access token.
              </p>
            </div>

            <a
              href={`mailto:${contactEmail}?subject=${subject}&body=${body}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-indigo-100"
            >
              Request data deletion
              <ArrowRight className="size-4" />
            </a>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5 text-sm text-slate-400">
            Contact:{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium text-indigo-300 hover:text-white"
            >
              {contactEmail}
            </a>
          </div>
        </div>
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
