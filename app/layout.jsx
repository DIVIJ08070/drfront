'use client'
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import PushInitializer from "./components/PushInitializer";
import ForegroundMessageListener from "./components/ForegroundMessageListener";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ForegroundMessageListener />
        <PushInitializer />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}