"use client";

import { useEffect } from "react";
import { onForegroundMessage } from "@/lib/firebase-messaging";

export default function ForegroundMessageListener() {
  useEffect(() => {
    const unsubscribe = onForegroundMessage(payload => {
      console.log("Foreground push:", payload);

      // YOU decide UI
      alert(payload.data.title + " - " + payload.data.body);
    });

    return unsubscribe;
  }, []);

  return null;
}

