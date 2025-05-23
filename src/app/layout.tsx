import type { Metadata } from "next";
import localFont from "next/font/local";
import React from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const monaSans = localFont({
  src: "../assets/font/Mona-Sans.ttf",
  variable: "--font-mona-sans",
  display: "swap",
  preload: true,
});

const sourceSerif = localFont({
  src: "../assets/font/SourceSerif4[opsz,wght].ttf",
  variable: "--font-source-serif",
  display: "swap",
  preload: true,
});

const helveticaRounded = localFont({
  src: "../assets/font/helvetica-rounded-bold-5871d05ead8de.otf",
  variable: "--font-helveticaRounded",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "音乐搜索 | Music Search App",
    template: "%s | Music Search App"
  },
  description: "一个强大的音乐搜索应用，帮助您快速找到喜爱的音乐",
};

// if (typeof window === "undefined") {
//   initPrisma().catch(console.error);

//   process.on("SIGINT", async () => {
//     await disconnectPrisma();
//     process.exit(0);
//   });

//   process.on("SIGTERM", async () => {
//     await disconnectPrisma();
//     process.exit();
//   });
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${monaSans.variable} ${sourceSerif.variable} ${helveticaRounded.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
