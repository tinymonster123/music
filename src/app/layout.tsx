import type { Metadata } from "next";
import localFont from "next/font/local";
import React from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";
import { auth } from "../../auth";

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

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await auth();

  return (
    <html lang="en" className={`${monaSans.variable} ${sourceSerif.variable} ${helveticaRounded.variable}`}>
      <body className={`${monaSans.variable} ${sourceSerif.variable} ${helveticaRounded.variable} font-mona antialiased`}>
        <SessionProvider session={session}>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
