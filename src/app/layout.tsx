import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CutBase - Video Editor Marketplace",
  description: "Connect with professional video editors for your projects. Find talented editors, showcase your portfolio, and grow your video editing business.",
  keywords: ["video editing", "freelance", "marketplace", "video editors", "motion graphics", "color grading"],
  authors: [{ name: "CutBase Team" }],
  creator: "CutBase",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cutbase.com",
    title: "CutBase - Video Editor Marketplace",
    description: "Connect with professional video editors for your projects",
    siteName: "CutBase",
  },
  twitter: {
    card: "summary_large_image",
    title: "CutBase - Video Editor Marketplace",
    description: "Connect with professional video editors for your projects",
    creator: "@cutbase",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
