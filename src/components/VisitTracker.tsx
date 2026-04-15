import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const VisitTracker = () => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await supabase.from("site_visits").insert({
          page: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        });
      } catch {}
    };
    trackVisit();
  }, []);

  return null;
};

export default VisitTracker;
