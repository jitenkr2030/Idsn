import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IDSN Portal - Indian Digital School Network",
  description: "Join India's premier digital school certification network. Get recognized, train your educators, and lead the digital transformation in education.",
  keywords: ["IDSN", "Digital School", "Education Certification", "School Network", "Digital Transformation"],
  authors: [{ name: "IDSN Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "IDSN Portal - Indian Digital School Network",
    description: "Empowering Indian schools with digital excellence and recognition",
    url: "https://idsn.z.ai",
    siteName: "IDSN Portal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IDSN Portal - Indian Digital School Network",
    description: "Empowering Indian schools with digital excellence and recognition",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
