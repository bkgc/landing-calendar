"use client";

import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { useCallback, useEffect, useState } from "react";

import { getFirebaseApp } from "@/lib/firebase/config";

export function useFCM() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkPermission() {
      try {
        if (typeof window === "undefined" || !("Notification" in window)) return;
        if (Notification.permission === "granted" && (await isSupported())) {
          if (isMounted) setEnabled(true);
        }
      } catch {
        // Silencioso en caso de no soporte
      }
    }
    void checkPermission();
    return () => {
      isMounted = false;
    };
  }, []);

  const enable = useCallback(async () => {
    setLoading(true);
    try {
      if (!(await isSupported()) || !("Notification" in window)) return false;
      const permission = await Notification.requestPermission();
      if (permission !== "granted" || !process.env.NEXT_PUBLIC_FCM_VAPID_KEY)
        return false;
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      const token = await getToken(getMessaging(getFirebaseApp()), {
        vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      if (!token) return false;
      const response = await fetch("/api/notifications/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      setEnabled(Boolean(result.success));
      return Boolean(result.success);
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { enable, enabled, loading };
}
