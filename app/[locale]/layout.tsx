
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

import { AppProvider } from "@/providers";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const locales = ["en", "am", "or"] as const;

type Locale = (typeof locales)[number];

const localeMetadata: Record<
  Locale,
  {
    title: string;
    description: string;
    ogLocale: string;
  }
> = {
  en: {
    title: "CivicPulse | Adama City Social Intelligence",
    description:
      "Understand public conversations with CivicPulse, an AI-powered social media intelligence platform for Facebook engagement analytics, sentiment analysis, and citizen feedback insights in Adama City.",
    ogLocale: "en_US",
  },
  am: {
    title: "CivicPulse | የአዳማ ከተማ ማህበራዊ መረጃ ትንተና",
    description:
      "CivicPulse የአዳማ ከተማ የማህበራዊ ሚዲያ ተሳትፎን፣ የህዝብ አስተያየትን እና የስሜት ትንተናን በAI ቴክኖሎጂ ለመረዳት የሚያግዝ መድረክ ነው።",
    ogLocale: "am_ET",
  },
  or: {
    title: "CivicPulse | Xiinxala Odeeffannoo Hawaasaa Magaalaa Adaamaa",
    description:
      "CivicPulse waltajjii AI fayyadamuun marii hawaasaa, hirmaannaa Facebook, xiinxala miiraa fi yaada uummataa Magaalaa Adaamaa hubachuuf gargaarudha.",
    ogLocale: "om_ET",
  },
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requestedLocale } = await params;

  if (!locales.includes(requestedLocale as Locale)) {
    notFound();
  }

  const locale = requestedLocale as Locale;
  const currentMetadata = localeMetadata[locale];

  return {
    metadataBase: appUrl ? new URL(appUrl) : undefined,

    applicationName: "CivicPulse",

    title: {
      default: currentMetadata.title,
      template: "%s | CivicPulse",
    },

    description: currentMetadata.description,

    keywords: [
      "CivicPulse",
      "Adama City",
      "Adama City Administration",
      "Social Intelligence",
      "Social Media Analytics",
      "Facebook Analytics",
      "AI Sentiment Analysis",
      "Public Sentiment Analysis",
      "Citizen Feedback",
      "Public Opinion",
      "Social Media Monitoring",
      "Engagement Analytics",
      "AI Analytics",
      "Amharic Sentiment Analysis",
      "Afaan Oromo Sentiment Analysis",
      "Ethiopian AI",
    ],

    authors: [
      {
        name: "CivicPulse",
      },
    ],

    creator: "CivicPulse",
    publisher: "CivicPulse",
    category: "Technology",
    referrer: "strict-origin-when-cross-origin",

    icons: {
      icon: [
        {
          url: "/favicon.ico",
          sizes: "any",
        },
      ],
    },

    alternates: {
      languages: {
        en: "/en",
        am: "/am",
        or: "/or",
      },
    },

    openGraph: {
      type: "website",
      siteName: "CivicPulse",
      locale: currentMetadata.ogLocale,
      title: currentMetadata.title,
      description: currentMetadata.description,
      url: `/${locale}`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "CivicPulse - Adama City Social Intelligence Platform",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: currentMetadata.title,
      description: currentMetadata.description,
      images: ["/og-image.png"],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale: requestedLocale } = await params;

  if (!locales.includes(requestedLocale as Locale)) {
    notFound();
  }

  const locale = requestedLocale as Locale;

  const messages = (await import(`../../i18n/${locale}.json`)).default;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AppProvider>{children}</AppProvider>
          </NextIntlClientProvider>

          <Toaster
            richColors
            position="top-right"
            closeButton
            expand={false}
            toastOptions={{
              style: {
                fontSize: "14px",
                borderRadius: "10px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
