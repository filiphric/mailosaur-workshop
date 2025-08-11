import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mailosaur OTP Demo",
  description: "Demo of different one-time password login flows with Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}