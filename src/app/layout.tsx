import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "YChecker — Find Out If Your YC Application Would Get You Rejected",
  description:
    "Evaluated by AI trained on real YC partner criteria. No fluff. No encouragement. Just the truth. Get a structured report judging your application exactly the way a YC partner would.",
  keywords: [
    "Y Combinator",
    "YC application",
    "startup evaluation",
    "YC checker",
    "startup feedback",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-white text-primary-black">
        {children}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

