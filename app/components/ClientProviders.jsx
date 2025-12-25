"use client";

import { SessionProvider } from "next-auth/react";
import ForegroundMessageListener from "./components/ForegroundMessageListener";
import PushInitializer from "./components/PushInitializer";
import RegisterSW from "./components/RegisterSW";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ClientProviders({ children }) {
  return (
    <SessionProvider>
      <ForegroundMessageListener />
      <PushInitializer />
      <RegisterSW />
      {children}
      <ToastContainer />
    </SessionProvider>
  );
}
