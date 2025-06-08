import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from './components/Navigation'
import type { Metadata } from "next";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "HIKAYA",
  description: "Gamified Financial Education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ margin: 0, padding: 0 }}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
