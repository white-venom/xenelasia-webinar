import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xenelasia Consultancy LLP | 3D Responsive Webinar & Tech Platform",
  description: "Empowering professionals and enterprises through advanced technology, cybersecurity, compliance consulting, and live interactive webinars. Register to attend sessions, retrieve entry passes, and download verified completion certificates.",
  keywords: ["cybersecurity", "technology consulting", "webinars", "IT compliance", "ISO 27001", "VAPT", "Zero Trust", "learning management"],
  authors: [{ name: "Xenelasia Consultancy LLP" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
