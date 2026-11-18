import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/site";
import "./globals.css";

// Nohemi by Rajesh Rajput. Only Regular and Medium are bundled (see
// app/fonts/NOHEMI-LICENSE.txt), so the site uses weights 400 and 500.
// To add more weights, drop the files into app/fonts and list them here.
const nohemi = localFont({
  src: [
    { path: "./fonts/Nohemi-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Nohemi-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-nohemi",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${nohemi.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
