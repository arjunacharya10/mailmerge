import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mail Merge | Personalized Bulk Emails",
  description: "Send personalized bulk emails via Gmail. Upload CSV, compose templates with variables, and send or schedule your email campaigns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
