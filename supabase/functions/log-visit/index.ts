import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const visitor_id = String(body.visitor_id || "").trim();
    const page = String(body.page || "/");
    const referrer = body.referrer ? String(body.referrer).slice(0, 500) : null;
    const user_agent = body.user_agent ? String(body.user_agent).slice(0, 500) : null;

    if (!visitor_id || visitor_id.length < 12 || visitor_id.length > 128) {
      return new Response(JSON.stringify({ error: "invalid visitor_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!page.startsWith("/")) {
      return new Response(JSON.stringify({ error: "invalid page" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract client IP
    const xff = req.headers.get("x-forwarded-for") || "";
    const ip = xff.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "";

    let country: string | null = null;
    let country_code: string | null = null;
    let city: string | null = null;

    if (ip && !ip.startsWith("127.") && !ip.startsWith("10.") && !ip.startsWith("192.168.")) {
      try {
        const r = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: { "User-Agent": "DLM-Analytics/1.0" },
          signal: AbortSignal.timeout(2500),
        });
        if (r.ok) {
          const g = await r.json();
          country = g.country_name || null;
          country_code = g.country_code || null;
          city = g.city || null;
        }
      } catch {
        // ignore geo failures
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("site_visits").insert({
      visitor_id,
      page,
      referrer,
      user_agent,
      country,
      country_code,
      city,
    });

    if (error) {
      // Rate-limit (1/device/day) returns an exception – treat as success
      if (error.message?.includes("Rate limit")) {
        return new Response(JSON.stringify({ ok: true, skipped: "rate_limit" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
