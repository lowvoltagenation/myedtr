import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyEdtr - Professional Video Editor Marketplace",
  description: "Connect with top-tier video editors and motion graphics artists. MyEdtr is the premier marketplace for high-quality video editing services, from social media content to cinematic productions. Showcase your portfolio, find your next client, and elevate your video projects with professional editing expertise.",
  keywords: [
    "video editing", 
    "freelance video editors", 
    "video editor marketplace", 
    "motion graphics", 
    "color grading", 
    "video production", 
    "social media editing", 
    "youtube editing", 
    "professional video editing", 
    "video editing services",
    "post production",
    "video editing freelancers"
  ],
  authors: [{ name: "MyEdtr Team" }],
  creator: "MyEdtr",
  publisher: "MyEdtr",
  category: "Technology",
  classification: "Video Editing Marketplace",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.svg',
    apple: '/icon.svg'
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://myedtr.com",
    title: "MyEdtr - Professional Video Editor Marketplace",
    description: "Connect with top-tier video editors and motion graphics artists. Find professional video editing services for your projects, from social media content to cinematic productions.",
    siteName: "MyEdtr",
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'MyEdtr - Professional Video Editor Marketplace',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyEdtr - Professional Video Editor Marketplace",
    description: "Connect with top-tier video editors and motion graphics artists. Find professional video editing services for your projects.",
    creator: "@myedtr",
    site: "@myedtr",
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased theme-transition`}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
