import type { Metadata } from "next";
import { Fraunces, Source_Sans_3, Montserrat } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const marketing = Montserrat({
  variable: "--font-marketing",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Life Star Instructors Academy",
  description:
    "Become a certified driving instructor with Life Star — online worldwide, practical training in Minnesota.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${marketing.variable} antialiased`}>{children}</body>
    </html>
  );
}
