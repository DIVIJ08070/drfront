'use client'
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import ForegroundMessageListener from "./components/ForegroundMessageListener";
import PushInitializer from "./components/PushInitializer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ForegroundMessageListener />
        <SessionProvider>
          <PushInitializer />
          {children}
        </SessionProvider>
        <ToastContainer />
      </body>
    </html>
  );
}