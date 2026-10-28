
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Gavel,
  Globe2,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Scale,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | CivicPulse",
  description:
    "Read the Terms of Service governing access to and use of CivicPulse, including its social analytics, AI-assisted sentiment analysis, and Facebook integrations.",
  robots: {
    index: true,
    follow: true,
  },
};

const contactEmail = "privacy@yourdomain.com"; // Replace before publishing

const sections = [
  {
    number: "01",
    title: "Acceptance of these terms",
    icon: FileText,
    content: (
      <>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of CivicPulse, including its website, application, features, and
          related services (collectively, the &quot;Services&quot;).
        </p>
        <p>
          By accessing or using CivicPulse, you agree to these Terms and our{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          . If you do not agree, you must not use the Services.
        </p>
        <p>
          If you use CivicPulse on behalf of an organization or public office,
          you confirm that you are authorized to accept these Terms on its
          behalf.
        </p>
      </>
    ),
  },
  {
    number: "02",
    title: "Eligibility and accounts",
    icon: Users,
    content: (
      <>
        <p>
          You must be legally capable of entering into a binding agreement
          under the laws applicable to you. CivicPulse may be intended for
          authorized personnel of public offices, organizations, and other
          approved users.
        </p>
        <p>You agree to:</p>
        <ul>
          <li>Provide accurate information when creating or using an account.</li>
          <li>Keep your login credentials confidential.</li>
          <li>Use only accounts and permissions assigned to you.</li>
          <li>Notify the appropriate CivicPulse administrator if you suspect unauthorized access.</li>
          <li>Keep your account information reasonably up to date.</li>
        </ul>
        <p>
          You are responsible for activity performed through your account,
          except to the extent applicable law provides otherwise. Do not share
          passwords, authentication codes, or access tokens with other people.
        </p>
      </>
    ),
  },
  {
    number: "03",
    title: "Our services",
    icon: BarChart3,
    content: (
      <>
        <p>
          CivicPulse provides social intelligence tools intended to help
          authorized users understand public conversations and engagement on
          connected social media Pages.
        </p>
        <p>Depending on the features enabled for your account, the Services may include:</p>
        <ul>
          <li>Viewing and organizing comments and engagement information.</li>
          <li>AI-assisted sentiment classification and topic analysis.</li>
          <li>Identifying potentially urgent or high-priority comments.</li>
          <li>Visualizing trends, summaries, and analytical insights.</li>
          <li>Supporting multiple languages, including Amharic, Afaan Oromo, and English.</li>
          <li>Connecting to supported Meta or Facebook services when properly authorized.</li>
        </ul>
        <p>
          Available features depend on your account permissions, system
          configuration, third-party platform capabilities, and applicable
          access restrictions.
        </p>
      </>
    ),
  },
  {
    number: "04",
    title: "Acceptable use",
    icon: ShieldCheck,
    content: (
      <>
        <p>
          You must use CivicPulse lawfully, responsibly, and in accordance
          with these Terms and any policies that apply to connected services.
        </p>
        <p>You must not:</p>
        <ul>
          <li>Use the Services for unlawful, fraudulent, deceptive, or harmful activities.</li>
          <li>Attempt to gain unauthorized access to accounts, data, or systems.</li>
          <li>Interfere with the security, availability, or normal operation of the Services.</li>
          <li>Reverse engineer, copy, or redistribute protected software or content except where permitted by law.</li>
          <li>Collect, disclose, or misuse personal information without appropriate authority or a lawful basis.</li>
          <li>Use automated access methods to bypass technical restrictions or access controls.</li>
          <li>Use CivicPulse in violation of applicable laws, privacy rights, or third-party platform policies.</li>
        </ul>
        <p>
          You must have the necessary authority to access connected Pages and
          information. Access to CivicPulse does not grant ownership of, or
          unrestricted rights to use, third-party data.
        </p>
      </>
    ),
  },
  {
    number: "05",
    title: "Facebook and third-party services",
    icon: Globe2,
    content: (
      <>
        <p>
          CivicPulse may integrate with Meta, Facebook, and other third-party
          services. These integrations may require you to authorize specific
          permissions and maintain the necessary roles or access rights.
        </p>
        <p>You agree to:</p>
        <ul>
          <li>Connect only Pages or accounts you are authorized to manage.</li>
          <li>Use data obtained through integrations only for permitted purposes.</li>
          <li>Comply with applicable Meta terms, developer policies, and permission requirements.</li>
          <li>Respect the privacy rights and applicable restrictions associated with comments and other social media data.</li>
        </ul>
        <p>
          Third-party services are operated independently of CivicPulse and
          may change their APIs, permissions, availability, or policies. Such
          changes may affect some features. CivicPulse does not control those
          third-party decisions.
        </p>
        <p>
          You can review our{" "}
          <Link
            href="/data-deletion"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Data Deletion instructions
          </Link>{" "}
          for information about disconnecting Facebook access and requesting
          deletion of applicable data.
        </p>
      </>
    ),
  },
  {
    number: "06",
    title: "AI analysis and its limitations",
    icon: MessageSquareText,
    content: (
      <>
        <p>
          CivicPulse may use automated models to classify sentiment, identify
          topics, prioritize comments, and generate analytical summaries.
          These results are estimates produced by automated systems.
        </p>
        <p>
          AI-generated results may be inaccurate, incomplete, or affected by
          language variation, dialect, sarcasm, spelling, context, cultural
          references, or ambiguous wording.
        </p>
        <ul>
          <li>Sentiment classifications are not definitive statements about a person's intentions or beliefs.</li>
          <li>Priority scores and alerts may not identify every urgent issue or may flag content incorrectly.</li>
          <li>Analytical summaries should be reviewed in context before decisions are made.</li>
          <li>Users remain responsible for decisions and actions based on analytical outputs.</li>
        </ul>
        <p>
          CivicPulse is an analytical support tool, not a substitute for
          professional judgment, direct verification, or appropriate human
          review. Do not rely solely on automated results for consequential
          decisions affecting individuals.
        </p>
      </>
    ),
  },
  {
    number: "07",
    title: "Privacy and data handling",
    icon: LockKeyhole,
    content: (
      <>
        <p>
          Our{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>{" "}
          explains how CivicPulse handles personal information and other data
          in connection with the Services.
        </p>
        <p>
          Depending on the features you use, the Services may process account
          details, authorized Page information, comments, engagement metrics,
          analytical results, and technical information needed to operate and
          secure the platform.
        </p>
        <p>
          You must have the appropriate authority and lawful basis for any
          personal information you submit, access, or process through
          CivicPulse. You must not use the Services to unlawfully expose,
          profile, or target individuals.
        </p>
        <p>
          You may use the{" "}
          <Link
            href="/data-deletion"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Data Deletion page
          </Link>{" "}
          to learn how to submit a deletion request. Requests are handled
          subject to applicable law and any lawful retention requirements.
        </p>
      </>
    ),
  },
  {
    number: "08",
    title: "Fees and payments",
    icon: Wallet,
    content: (
      <>
        <p>
          If CivicPulse offers paid features, subscriptions, or other
          chargeable services, the applicable price, billing period, payment
          terms, and any cancellation conditions will be communicated before
          you commit to the relevant purchase.
        </p>
        <p>
          You are responsible for applicable charges and taxes disclosed to
          you in connection with a purchase. Any refunds, cancellations, and
          renewals will be governed by the terms presented for the relevant
          offering and applicable law.
        </p>
        <p>
          This section does not mean that CivicPulse currently offers paid
          subscriptions or payment processing. It applies only where such
          offerings are made available.
        </p>
      </>
    ),
  },
  {
    number: "09",
    title: "Intellectual property",
    icon: FileText,
    content: (
      <>
        <p>
          Subject to third-party rights, CivicPulse and its licensors retain
          their rights in the platform, software, branding, design, and
          original materials made available through the Services.
        </p>
        <p>
          These Terms grant you a limited, non-exclusive, non-transferable
          right to use the Services for their intended purpose, subject to
          your account permissions and these Terms. No ownership rights are
          transferred to you.
        </p>
        <p>
          You retain any rights you hold in content you submit. You authorize
          CivicPulse to process that content as reasonably necessary to
          provide, secure, and operate the Services, subject to the Privacy
          Policy and applicable law.
        </p>
        <p>
          Third-party names, trademarks, and content remain the property of
          their respective owners. Your use of CivicPulse does not imply
          endorsement by Meta or Facebook.
        </p>
      </>
    ),
  },
  {
    number: "10",
    title: "Availability and service changes",
    icon: Clock3,
    content: (
      <>
        <p>
          We aim to provide a reliable service, but uninterrupted access
          cannot be guaranteed. Access may occasionally be affected by
          maintenance, security incidents, connectivity problems, system
          failures, or third-party service changes.
        </p>
        <p>
          We may modify, improve, suspend, or discontinue features when
          reasonably necessary, subject to applicable law and any separate
          commitments that apply to your account.
        </p>
        <p>
          Where practical, we will provide notice of material changes that
          significantly affect the Services. Nothing in these Terms excludes
          obligations that cannot lawfully be excluded.
        </p>
      </>
    ),
  },
  {
    number: "11",
    title: "Suspension and termination",
    icon: ShieldCheck,
    content: (
      <>
        <p>
          We may restrict, suspend, or terminate access where reasonably
          necessary to protect the Services, respond to a security risk,
          comply with law, enforce these Terms, or address unauthorized use.
        </p>
        <p>
          Where appropriate and legally permitted, we will provide notice and
          an opportunity to address the issue. You may stop using the Services
          at any time, subject to any separate agreement that applies to your
          organization.
        </p>
        <p>
          Termination does not remove rights or obligations that arose before
          termination. Data handling following account closure remains
          subject to our Privacy Policy and applicable retention requirements.
        </p>
      </>
    ),
  },
  {
    number: "12",
    title: "Disclaimers and limitation of liability",
    icon: Scale,
    content: (
      <>
        <p>
          To the extent permitted by applicable law, the Services are provided
          on an &quot;as available&quot; basis. We do not guarantee that every
          feature will always be available, that all third-party data will be
          complete, or that AI-generated results will be accurate.
        </p>
        <p>
          To the extent permitted by applicable law, CivicPulse will not be
          liable for indirect or consequential losses arising from use of the
          Services, including losses resulting from reliance on inaccurate
          automated analysis or interruptions caused by third-party platforms.
        </p>
        <p>
          Nothing in these Terms excludes or limits liability, consumer
          rights, or other protections that cannot legally be excluded or
          limited under the law that applies to you. Any applicable
          limitations remain subject to those mandatory protections.
        </p>
      </>
    ),
  },
  {
    number: "13",
    title: "Changes to these Terms",
    icon: Gavel,
    content: (
      <>
        <p>
          We may update these Terms to reflect changes to CivicPulse, legal
          requirements, security practices, or our operating procedures.
        </p>
        <p>
          When changes are material, we will take reasonable steps to notify
          affected users where appropriate. The updated version will be
          published on this page with a revised update date.
        </p>
        <p>
          Your continued use of the Services after updated Terms take effect
          will be subject to the revised Terms to the extent permitted by
          applicable law. Where affirmative consent is legally required, we
          will obtain it.
        </p>
      </>
    ),
  },
  {
    number: "14",
    title: "Contact and questions",
    icon: Mail,
    content: (
      <>
        <p>
          If you have questions about these Terms, your account, or the
          operation of CivicPulse, contact our team using the email address
          below.
        </p>
        <p>
          For requests involving personal information or data deletion, you
          can also consult our{" "}
          <Link
            href="/data-deletion"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Data Deletion page
          </Link>
          .
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="size-5" />
            </span>
            <span>
              <span className="block text-base font-bold tracking-tight">
                CivicPulse
              </span>
              <span className="block text-xs text-muted-foreground">
                Social intelligence
              </span>
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="flex items-center gap-2 sm:gap-3"
          >
            <Link
              href="/privacy-policy"
              className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
            >
              Privacy Policy
            </Link>
            <Link
              href="/data-deletion"
              className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
            >
              Data Deletion
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign in
              <ArrowRight className="size-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-40 size-[30rem] rounded-full bg-indigo-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 left-1/3 size-[28rem] rounded-full bg-emerald-500/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Link
              href="/login"
              className="mb-8 inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300 sm:text-sm">
              Legal information
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Terms of Service
              <span className="mt-2 block text-slate-300">
                for CivicPulse.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              These Terms explain the rules for accessing and using CivicPulse,
              including our social analytics tools, AI-assisted insights, and
              supported third-party integrations.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/privacy-policy"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
              >
                <LockKeyhole className="size-4" />
                Privacy Policy
              </Link>
              <Link
                href="/data-deletion"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200"
              >
                Data Deletion
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <div className="relative flex aspect-square w-full max-w-sm items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-indigo-950/30">
              <div
                aria-hidden="true"
                className="absolute inset-8 rounded-full border border-white/10"
              />
              <div
                aria-hidden="true"
                className="absolute inset-16 rounded-full border border-dashed border-indigo-300/30"
              />
              <div className="relative flex size-40 items-center justify-center rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/30 to-emerald-400/10 shadow-xl">
                <ShieldCheck className="size-24 text-indigo-200" strokeWidth={1.3} />
              </div>
              <div className="absolute right-8 top-10 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 shadow-lg">
                <FileText className="size-6 text-emerald-300" />
              </div>
              <div className="absolute bottom-10 left-8 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 shadow-lg">
                <CheckCircle2 className="size-6 text-indigo-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 sm:pt-10">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>

          <div className="flex-1">
            <h2 className="font-semibold">Built on clarity and accountability</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              Our goal is to make the rules for using CivicPulse clear, while
              supporting responsible handling of data and analytical results.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full bg-muted px-3 py-2 text-xs font-medium text-muted-foreground sm:self-center">
            <Clock3 className="size-4" />
            Last updated: October 28, 2026
          </div>
        </div>
      </section>

      {/* Contents and terms */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14 lg:py-16">
        <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-28">
          <h2 className="text-sm font-bold">On this page</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Browse the main terms and conditions.
          </p>

          <nav aria-label="Terms contents" className="mt-5 space-y-1">
            {sections.map((section) => (
              <a
                key={section.number}
                href={`#section-${section.number}`}
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="mt-0.5 text-xs font-bold text-primary">
                  {section.number}
                </span>
                <span>{section.title}</span>
              </a>
            ))}
          </nav>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-xs leading-5 text-muted-foreground">
              Looking for information about your data?
            </p>
            <Link
              href="/privacy-policy"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Visit Privacy Policy
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              The terms that govern your use
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Please read these Terms carefully. They describe the conditions
              under which CivicPulse is provided and the responsibilities of
              users who access the platform.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              These Terms are a general template and should be reviewed for
              your organization, jurisdiction, and actual service practices
              before they are published as a binding legal agreement.
            </p>
          </div>

          <div className="space-y-0">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <article
                  key={section.number}
                  id={`section-${section.number}`}
                  className="scroll-mt-28 border-t border-border py-8 first:border-t-0 first:pt-0 sm:py-9"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold tracking-[0.16em] text-primary">
                        SECTION {section.number}
                      </p>
                      <h3 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
                        {section.title}
                      </h3>

                      <div className="prose-civic mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Contact */}
          <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/[0.05] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold">Questions about these Terms?</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Contact the CivicPulse team if you need clarification about
                  these Terms or your use of the platform.
                </p>
                <a
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent("CivicPulse Terms of Service inquiry")}`}
                  className="mt-4 inline-flex items-center gap-2 break-all text-sm font-semibold text-primary hover:underline"
                >
                  <Mail className="size-4 shrink-0" />
                  {contactEmail}
                  <ArrowRight className="size-4 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing callout */}
      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 sm:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-indigo-500/20 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex size-11 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck className="size-6 text-emerald-300" />
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
                Responsible insights. Clear expectations.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                Review how CivicPulse handles your information and how to
                request deletion whenever you need to.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/privacy-policy"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
              >
                Privacy Policy
              </Link>
              <Link
                href="/data-deletion"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200"
              >
                Data Deletion
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">CivicPulse</span>
              <span className="block text-xs text-muted-foreground">
                Social intelligence
              </span>
            </span>
          </Link>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CivicPulse. All rights reserved.
          </p>

          <nav
            aria-label="Legal footer"
            className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground"
          >
            <Link
              href="/privacy-policy"
              className="hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="/data-deletion"
              className="hover:text-foreground"
            >
              Data Deletion
            </Link>
          </nav>
        </div>
      </footer>

      {/* Rich text styling for policy content */}
      <style>{`
        .prose-civic p {
          margin: 0;
        }

        .prose-civic ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.65rem;
        }

        .prose-civic li {
          position: relative;
          padding-left: 1.65rem;
        }

        .prose-civic li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.6rem;
          width: 0.55rem;
          height: 0.55rem;
          border-radius: 9999px;
          background: var(--primary);
          opacity: 0.8;
        }
      `}</style>
    </main>
  );
}
