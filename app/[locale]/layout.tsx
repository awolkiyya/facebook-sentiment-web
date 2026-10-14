// app/[locale]/layout.tsx
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
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: {
    default: "Mayor AI Insights | Adama City",
    template: "%s | Mayor AI Insights",
  },

  description:
    "An AI-powered social media analytics platform for analyzing public sentiment, engagement, and feedback on the Adama City Mayor's Facebook page.",

  keywords: [
    "Adama City",
    "Mayor AI",
    "Facebook Analytics",
    "Sentiment Analysis",
    "AI Sentiment Analytics",
    "Social Media Intelligence",
    "Public Sentiment",
    "Citizen Feedback",
    "Civic Analytics",
    "Mayor's Facebook",
    "Public Opinion",
    "AI Analytics",
    "Adama City Administration",
  ],

  authors: [
    {
      name: "Adama City Administration",
    },
  ],

  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const locales = ["en", "am", "or"] as const;

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const messages = (await import(`../../i18n/${locale}.json`)).default;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {/* ✅ ThemeProvider here — Server Component context, script injection is safe */}
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