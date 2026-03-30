import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalDialog from "@/components/common/GlobalDialog";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Happy Cat - Education System",
  description: "Happy Cat - Nền tảng học tập toàn diện cho học sinh, giáo viên và phụ huynh",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50' y='55' font-size='80' text-anchor='middle' dominant-baseline='middle'>🐱</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${interSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <GlobalDialog />
      </body>
    </html>
  );
}
