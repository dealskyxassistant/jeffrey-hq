import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jeffrey HQ — Mission Control",
  description: "Dealsky AI Agent Network Dashboard",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
