"use client";

import { useEffect } from "react";
import { getOrCreateFcmToken } from "@/lib/firebase-messaging";

export default function PushInitializer() {
  useEffect(() => {
    getOrCreateFcmToken().then(token => {
      if (!token) return;

      console.log("Generated fcm token: "+ token);
    });
  }, []);

  return null;
}
