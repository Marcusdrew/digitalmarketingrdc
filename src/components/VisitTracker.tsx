import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const getVisitorId = async (): Promise<string> => {
  // v4: identifiant aléatoire stable par appareil.
  // L'ancienne empreinte pouvait être identique sur deux téléphones du même modèle.
  const key = "dlm_visitor_id_v4";
  const storedId = localStorage.getItem(key);
  if (storedId) return storedId;

  const id = `device_${crypto.randomUUID()}`;

  localStorage.setItem(key, id);
  localStorage.removeItem("dlm_visitor_id");
  localStorage.removeItem("dlm_visitor_id_v2");
  localStorage.removeItem("dlm_visitor_id_v3");
  Object.keys(localStorage)
    .filter((k) => k.startsWith("dlm_visit_"))
    .forEach((k) => localStorage.removeItem(k));

  return id;
};

const VisitTracker = () => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Ignorer le trafic de prévisualisation Lovable et les bots
        const host = window.location.hostname;
        const isPreview =
          host.endsWith(".lovableproject.com") ||
          host.startsWith("id-preview--") ||
          host === "localhost" ||
          host === "127.0.0.1";
        const ua = navigator.userAgent || "";
        const isBot = /bot|crawler|spider|crawling|preview|headless|lighthouse|pingdom/i.test(ua);
        if (isPreview || isBot) return;

        const visitorId = await getVisitorId();
        const today = new Date().toISOString().split("T")[0];
        const trackKey = `dlm_visit_${today}`;

        if (localStorage.getItem(trackKey)) return;

        await supabase.functions.invoke("log-visit", {
          body: {
            visitor_id: visitorId,
            page: window.location.pathname,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
          },
        });

        localStorage.setItem(trackKey, "1");
      } catch {}
    };
    trackVisit();
  }, []);

  return null;
};

export default VisitTracker;
