import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SecureVault - Enterprise MPC Wallet",
  description: "Enterprise-grade multi-party computation wallet for secure digital asset management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="gradient-bg min-h-screen font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
