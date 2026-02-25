import type { Metadata } from "next";
import { Foldit, Jacquard_24, Jacquard_12, Nabla, DM_Sans } from "next/font/google";
import "./globals.css";

const foldIt = Foldit({
  variable: "--font-foldit",
  subsets: ["latin"],
});

const jacquard24 = Jacquard_24({
  variable: "--font-jacquard-24",
  weight: "400",
  subsets: ["latin"],
});

const jacquard12 = Jacquard_12({
  variable: "--font-jacquard-12",
  weight: "400",
  subsets: ["latin"],
});

const nabla = Nabla({
  variable: "--font-nabla",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POV",
  description: "show me your pov",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${foldIt.variable} ${jacquard24.variable} ${jacquard12.variable} ${nabla.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
