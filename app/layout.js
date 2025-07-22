import { Geist, Geist_Mono } from "next/font/google";
import "./css/globals.css";
import "./css/Leaderboard.css";
import "./css/promptr.css";
import "./css/navbar.css";
import "./css/page.css";
import "./css/freeplay.css";
import Navbar from "./components/Navbar";
import Head from "next/head"; // ⬅️ Import Head

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PROMPTR - AI Deepfake Detector Game",
  description: "Test your skills at detecting AI-generated images in this interactive game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
