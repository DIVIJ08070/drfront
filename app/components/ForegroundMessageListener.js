"use client";

import { useEffect, useRef } from "react";
import { onForegroundMessage } from "@/lib/firebase-messaging";
import { toast } from 'react-toastify';

export default function ForegroundMessageListener() {
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    const setup = async () => {
      const unsubscribe = await onForegroundMessage(payload => {
        const { title, body, url } = payload.data || {};
        console.log("Foreground message received:", { title, body, url });
        // Only show notification if the tab is visible
        if (document.visibilityState === 'visible') {
          toast.info(`${title}: ${body}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      });
      unsubscribeRef.current = unsubscribe;
    };

    setup();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
    console.log("ForegroundMessageListener mounted");
  }, []);

  return null;
}

