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
  title: "TaskFlow — Ticket Management",
  description: "A focused project and ticket management workspace for modern teams.",
  openGraph: {
    title: "TaskFlow — Keep work moving",
    description: "A focused project and ticket management workspace for modern teams.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "TaskFlow kanban workspace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskFlow — Keep work moving",
    description: "A focused project and ticket management workspace for modern teams.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
