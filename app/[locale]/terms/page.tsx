
import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
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
} from "lucide-react";

import LegalPageLayout from "@/components/legal/LegalPageLayout";
import LegalSection from "@/components/legal/LegalSection";
import LegalContact from "@/components/legal/LegalContact";
import { legalConfig } from "@/configs/legal.config";

export const metadata: Metadata = {
  title: "Terms of Service | CivicPulse",
  description:
    "Read the Terms of Service governing access to and use of CivicPulse, including its social analytics, AI-assisted sentiment analysis, and Facebook integrations.",
  robots: {
    index: true,
    follow: true,
  },
};

const contactEmail = legalConfig.contact.privacyEmail;

const sections = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of these terms",
    icon: FileText,
    content: (
      <>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to
          and use of CivicPulse, including its website, application,
          features, and related services (collectively, the
          &quot;Services&quot;).
        </p>

        <p>
          By accessing or using CivicPulse, you agree to these Terms and
          our{" "}
          <Link
            href={legalConfig.routes.privacy}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          . If you do not agree, you must not use the Services.
        </p>

        <p>
          If you use CivicPulse on behalf of an organization or public
          office, you confirm that you are authorized to accept these
          Terms on its behalf.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    number: "02",
    title: "Eligibility and accounts",
    icon: Users,
    content: (
      <>
        <p>
          You must be legally capable of entering into a binding
          agreement under the laws applicable to you. CivicPulse may be
          intended for authorized personnel of public offices,
          organizations, and other approved users.
        </p>

        <p>You agree to:</p>

        <ul>
          <li>
            Provide accurate information when creating or using an
            account.
          </li>
          <li>Keep your login credentials confidential.</li>
          <li>Use only accounts and permissions assigned to you.</li>
          <li>
            Notify the appropriate CivicPulse administrator if you
            suspect unauthorized access.
          </li>
          <li>Keep your account information reasonably up to date.</li>
        </ul>

        <p>
          You are responsible for activity performed through your
          account, except to the extent applicable law provides
          otherwise. Do not share passwords, authentication codes, or
          access tokens with other people.
        </p>
      </>
    ),
  },
  {
    id: "services",
    number: "03",
    title: "Our services",
    icon: BarChart3,
    content: (
      <>
        <p>
          CivicPulse provides social intelligence tools intended to help
          authorized users understand public conversations and
          engagement on connected social media Pages.
        </p>

        <p>
          Depending on the features enabled for your account, the
          Services may include:
        </p>

        <ul>
          <li>
            Viewing and organizing comments and engagement information.
          </li>
          <li>
            AI-assisted sentiment classification and topic analysis.
          </li>
          <li>
            Identifying potentially urgent or high-priority comments.
          </li>
          <li>
            Visualizing trends, summaries, and analytical insights.
          </li>
          <li>
            Supporting multiple languages, including Amharic, Afaan
            Oromo, and English.
          </li>
          <li>
            Connecting to supported Meta or Facebook services when
            properly authorized.
          </li>
        </ul>

        <p>
          Available features depend on your account permissions, system
          configuration, third-party platform capabilities, and
          applicable access restrictions.
        </p>

        <p>
          CivicPulse is currently provided free of charge. Users are
          not required to pay subscription fees, usage fees, or other
          service charges to access the currently available features.
          If this changes in the future, we will communicate the
          applicable terms and any required changes before introducing
          paid services.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    number: "04",
    title: "Acceptable use",
    icon: ShieldCheck,
    content: (
      <>
        <p>
          You must use CivicPulse lawfully, responsibly, and in
          accordance with these Terms and any policies that apply to
          connected services.
        </p>

        <p>You must not:</p>

        <ul>
          <li>
            Use the Services for unlawful, fraudulent, deceptive, or
            harmful activities.
          </li>
          <li>
            Attempt to gain unauthorized access to accounts, data, or
            systems.
          </li>
          <li>
            Interfere with the security, availability, or normal
            operation of the Services.
          </li>
          <li>
            Reverse engineer, copy, or redistribute protected software
            or content except where permitted by law.
          </li>
          <li>
            Collect, disclose, or misuse personal information without
            appropriate authority or a lawful basis.
          </li>
          <li>
            Use automated access methods to bypass technical
            restrictions or access controls.
          </li>
          <li>
            Use CivicPulse in violation of applicable laws, privacy
            rights, or third-party platform policies.
          </li>
        </ul>

        <p>
          You must have the necessary authority to access connected
          Pages and information. Access to CivicPulse does not grant
          ownership of, or unrestricted rights to use, third-party data.
        </p>
      </>
    ),
  },
  {
    id: "third-party-services",
    number: "05",
    title: "Facebook and third-party services",
    icon: Globe2,
    content: (
      <>
        <p>
          CivicPulse may integrate with Meta, Facebook, and other
          third-party services. These integrations may require you to
          authorize specific permissions and maintain the necessary
          roles or access rights.
        </p>

        <p>You agree to:</p>

        <ul>
          <li>
            Connect only Pages or accounts you are authorized to
            manage.
          </li>
          <li>
            Use data obtained through integrations only for permitted
            purposes.
          </li>
          <li>
            Comply with applicable Meta terms, developer policies, and
            permission requirements.
          </li>
          <li>
            Respect the privacy rights and applicable restrictions
            associated with comments and other social media data.
          </li>
        </ul>

        <p>
          Third-party services are operated independently of CivicPulse
          and may change their APIs, permissions, availability, or
          policies. Such changes may affect some features. CivicPulse
          does not control those third-party decisions.
        </p>

        <p>
          You can review our{" "}
          <Link
            href={legalConfig.routes.dataDeletion}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Data Deletion instructions
          </Link>{" "}
          for information about disconnecting Facebook access and
          requesting deletion of applicable data.
        </p>
      </>
    ),
  },
  {
    id: "ai-analysis",
    number: "06",
    title: "AI analysis and its limitations",
    icon: MessageSquareText,
    content: (
      <>
        <p>
          CivicPulse may use automated models to classify sentiment,
          identify topics, prioritize comments, and generate analytical
          summaries. These results are estimates produced by automated
          systems.
        </p>

        <p>
          AI-generated results may be inaccurate, incomplete, or
          affected by language variation, dialect, sarcasm, spelling,
          context, cultural references, or ambiguous wording.
        </p>

        <ul>
          <li>
            Sentiment classifications are not definitive statements
            about a person&apos;s intentions or beliefs.
          </li>
          <li>
            Priority scores and alerts may not identify every urgent
            issue or may flag content incorrectly.
          </li>
          <li>
            Analytical summaries should be reviewed in context before
            decisions are made.
          </li>
          <li>
            Users remain responsible for decisions and actions based on
            analytical outputs.
          </li>
        </ul>

        <p>
          CivicPulse is an analytical support tool, not a substitute
          for professional judgment, direct verification, or
          appropriate human review. Do not rely solely on automated
          results for consequential decisions affecting individuals.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    number: "07",
    title: "Privacy and data handling",
    icon: LockKeyhole,
    content: (
      <>
        <p>
          Our{" "}
          <Link
            href={legalConfig.routes.privacy}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>{" "}
          explains how CivicPulse handles personal information and
          other data in connection with the Services.
        </p>

        <p>
          Depending on the features you use, the Services may process
          account details, authorized Page information, comments,
          engagement metrics, analytical results, and technical
          information needed to operate and secure the platform.
        </p>

        <p>
          You must have the appropriate authority and lawful basis for
          any personal information you submit, access, or process
          through CivicPulse. You must not use the Services to
          unlawfully expose, profile, or target individuals.
        </p>

        <p>
          You may use the{" "}
          <Link
            href={legalConfig.routes.dataDeletion}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Data Deletion page
          </Link>{" "}
          to learn how to submit a deletion request. Requests are
          handled subject to applicable law and any lawful retention
          requirements.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    number: "08",
    title: "Intellectual property",
    icon: FileText,
    content: (
      <>
        <p>
          Subject to third-party rights, CivicPulse and its licensors
          retain their rights in the platform, software, branding,
          design, and original materials made available through the
          Services.
        </p>

        <p>
          These Terms grant you a limited, non-exclusive,
          non-transferable right to use the Services for their intended
          purpose, subject to your account permissions and these Terms.
          No ownership rights are transferred to you.
        </p>

        <p>
          You retain any rights you hold in content you submit. You
          authorize CivicPulse to process that content as reasonably
          necessary to provide, secure, and operate the Services,
          subject to the Privacy Policy and applicable law.
        </p>

        <p>
          Third-party names, trademarks, and content remain the
          property of their respective owners. Your use of CivicPulse
          does not imply endorsement by Meta or Facebook.
        </p>
      </>
    ),
  },
  {
    id: "availability",
    number: "09",
    title: "Availability and service changes",
    icon: Clock3,
    content: (
      <>
        <p>
          We aim to provide a reliable service, but uninterrupted
          access cannot be guaranteed. Access may occasionally be
          affected by maintenance, security incidents, connectivity
          problems, system failures, or third-party service changes.
        </p>

        <p>
          We may modify, improve, suspend, or discontinue features
          when reasonably necessary, subject to applicable law and any
          separate commitments that apply to your account.
        </p>

        <p>
          Where practical, we will provide notice of material changes
          that significantly affect the Services. Nothing in these
          Terms excludes obligations that cannot lawfully be excluded.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    number: "10",
    title: "Suspension and termination",
    icon: ShieldCheck,
    content: (
      <>
        <p>
          We may restrict, suspend, or terminate access where
          reasonably necessary to protect the Services, respond to a
          security risk, comply with law, enforce these Terms, or
          address unauthorized use.
        </p>

        <p>
          Where appropriate and legally permitted, we will provide
          notice and an opportunity to address the issue. You may stop
          using the Services at any time, subject to any separate
          agreement that applies to your organization.
        </p>

        <p>
          Termination does not remove rights or obligations that arose
          before termination. Data handling following account closure
          remains subject to our Privacy Policy and applicable
          retention requirements.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    number: "11",
    title: "Disclaimers and limitation of liability",
    icon: Scale,
    content: (
      <>
        <p>
          To the extent permitted by applicable law, the Services are
          provided on an &quot;as available&quot; basis. We do not
          guarantee that every feature will always be available, that
          all third-party data will be complete, or that AI-generated
          results will be accurate.
        </p>

        <p>
          To the extent permitted by applicable law, CivicPulse will
          not be liable for indirect or consequential losses arising
          from use of the Services, including losses resulting from
          reliance on inaccurate automated analysis or interruptions
          caused by third-party platforms.
        </p>

        <p>
          Nothing in these Terms excludes or limits liability,
          consumer rights, or other protections that cannot legally be
          excluded or limited under the law that applies to you. Any
          applicable limitations remain subject to those mandatory
          protections.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    number: "12",
    title: "Changes to these Terms",
    icon: Gavel,
    content: (
      <>
        <p>
          We may update these Terms to reflect changes to CivicPulse,
          legal requirements, security practices, or our operating
          procedures.
        </p>

        <p>
          When changes are material, we will take reasonable steps to
          notify affected users where appropriate. The updated version
          will be published on this page with a revised update date.
        </p>

        <p>
          Your continued use of the Services after updated Terms take
          effect will be subject to the revised Terms to the extent
          permitted by applicable law. Where affirmative consent is
          legally required, we will obtain it.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    number: "13",
    title: "Contact and questions",
    icon: Mail,
    content: (
      <>
        <p>
          If you have questions about these Terms, your account, or
          the operation of CivicPulse, contact our team using the
          email address below.
        </p>

        <p>
          For requests involving personal information or data deletion,
          you can also consult our{" "}
          <Link
            href={legalConfig.routes.dataDeletion}
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

const navigationSections = sections.map(({ id, title }) => ({
  id,
  title,
}));

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="LEGAL INFORMATION"
      title="Clear terms. Responsible use."
      description="These Terms explain the rules for accessing and using CivicPulse, including our social analytics tools, AI-assisted insights, and supported third-party integrations."
      updatedAt="October 28, 2026"
      sections={navigationSections}
      contactEmail={contactEmail}
      signInHref={legalConfig.brand.signInHref}
      trustMessage="Our goal is to make the rules for using CivicPulse clear while supporting responsible handling of data and analytical results."
      heroActions={[
        {
          label: "Privacy Policy",
          href: legalConfig.routes.privacy,
          variant: "secondary",
        },
        {
          label: "Data Deletion",
          href: legalConfig.routes.dataDeletion,
          variant: "primary",
        },
      ]}
    >
      <div className="mb-10 max-w-3xl">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          The terms that govern your use
        </h2>

        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          Please read these Terms carefully. They describe the
          conditions under which CivicPulse is provided and the
          responsibilities of users who access the platform.
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          CivicPulse is currently offered as a free service to
          authorized users. These Terms govern access to the platform
          and use of its available features.
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          These Terms should be reviewed for your organization,
          jurisdiction, and actual service practices before they are
          published as a binding legal agreement.
        </p>
      </div>

      <div className="space-y-0">
        {sections.map((section) => (
          <LegalSection
            key={section.id}
            id={section.id}
            number={section.number}
            title={section.title}
            icon={section.icon}
          >
            {section.content}
          </LegalSection>
        ))}
      </div>

      <div className="mt-8">
        <LegalContact
          eyebrow="TERMS AND SUPPORT"
          title="Questions about these Terms?"
          description="Contact the CivicPulse team if you need clarification about these Terms or your use of the platform."
          email={contactEmail}
          buttonLabel="Contact our team"
          icon={Mail}
        />
      </div>
    </LegalPageLayout>
  );
}
