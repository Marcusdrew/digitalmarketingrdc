import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const getVisitorId = (): string => {
  // v2: nouveau système de tracking propre (1 appareil = 1 vue/jour côté serveur)
  const key = "dlm_visitor_id_v2";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
    // Nettoyer l'ancien ID et les anciennes clés de tracking
    localStorage.removeItem("dlm_visitor_id");
    Object.keys(localStorage)
      .filter((k) => k.startsWith("dlm_visit_"))
      .forEach((k) => localStorage.removeItem(k));
  }
  return id;
};

const VisitTracker = () => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const visitorId = getVisitorId();
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
