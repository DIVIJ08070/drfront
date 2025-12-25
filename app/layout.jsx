
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import ForegroundMessageListener from "./components/ForegroundMessageListener";
import PushInitializer from "./components/PushInitializer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RegisterSW from "./components/RegisterSW";

export const metadata = {
  title: "My PWA",
  manifest: "/manifest.json",
  themeColor: "#000000"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ForegroundMessageListener />
        <SessionProvider>
          <PushInitializer />
          <RegisterSW />
          {children}
        </SessionProvider>
        <ToastContainer />
      </body>
    </html>
  );
}