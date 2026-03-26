import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { FetchInterceptorProvider } from "@/components/providers/fetch-interceptor";
import { CompanyProvider } from "@/context/CompanyContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "VMS P2P Prototype",
  description: "Vendor Management System",
  icons: {
    icon: "/images/icons/favicon.png",
    shortcut: "/images/icons/favicon.png",
    apple: "/images/icons/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-testid="root-html">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
        data-testid="root-body"
      >
        <FetchInterceptorProvider>
          <CompanyProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </CompanyProvider>
          <Toaster />
        </FetchInterceptorProvider>
      </body>
    </html>
  );
}
