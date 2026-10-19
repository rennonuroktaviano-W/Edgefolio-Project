import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AccountChip } from "@/components/auth/account-chip";
import { AccountChipGate } from "@/components/auth/account-chip-gate";
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
  title: "Edgefolio — Your Trading Edge Starts Here",
  description:
    "Track your trades, understand your performance, and make every decision more intentional.",
};

export const viewport: Viewport = {
  themeColor: "#111610",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-night text-ink">
        <noscript>
          <style>{`.reveal-up{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <AuthProvider>
          <AccountChipGate>
            <AccountChip />
          </AccountChipGate>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
