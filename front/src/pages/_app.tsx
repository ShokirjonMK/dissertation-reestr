import type { AppProps } from "next/app";
import { IBM_Plex_Serif, Noto_Sans_Mono } from "next/font/google";

import AppProviders from "@/components/providers/AppProviders";
import "@/styles/globals.css";

const headingFont = Noto_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600"],
});

const bodyFont = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${headingFont.variable} ${bodyFont.variable}`}>
      <AppProviders>
        <Component {...pageProps} />
      </AppProviders>
    </div>
  );
}
