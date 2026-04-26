import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const getVisitorId = async (): Promise<string> => {
  // v3: empreinte stable de l'appareil, sans dépendre du domaine ou de l'URL
  const key = "dlm_visitor_id_v3";
  const storedId = localStorage.getItem(key);
  if (storedId) return storedId;

  const fingerprint = [
    navigator.userAgent,
    navigator.platform,
    navigator.language,
    navigator.languages?.join(",") || "",
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    String(navigator.hardwareConcurrency || ""),
    String(navigator.maxTouchPoints || ""),
  ].join("|");

  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fingerprint));
  const hash = Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const id = `device_${hash}`;

  localStorage.setItem(key, id);
  localStorage.removeItem("dlm_visitor_id");
  localStorage.removeItem("dlm_visitor_id_v2");
  Object.keys(localStorage)
    .filter((k) => k.startsWith("dlm_visit_"))
    .forEach((k) => localStorage.removeItem(k));

  return id;
};

const VisitTracker = () => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const visitorId = await getVisitorId();
        const today = new Date().toISOString().split("T")[0];
        const trackKey = `dlm_visit_${today}`;

        // Only count once per device per day
        if (localStorage.getItem(trackKey)) return;

        await supabase.from("site_visits").insert({
          page: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          visitor_id: visitorId,
        });

        localStorage.setItem(trackKey, "1");
      } catch {}
    };
    trackVisit();
  }, []);

  return null;
};

export default VisitTracker;
