import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, TrendingUp, Calendar, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const AdminVisitStats = () => {
  const [view, setView] = useState<"overview" | "daily" | "monthly">("overview");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [overviewStats, setOverviewStats] = useState({ today: 0, todayUnique: 0, week: 0, weekUnique: 0, month: 0, monthUnique: 0, total: 0, totalUnique: 0 });
  const [dailyStats, setDailyStats] = useState<{ date: string; visits: number; unique: number }[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<{ month: number; year: number; visits: number; unique: number }[]>([]);

  const fetchOverview = useCallback(async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [todayRes, weekRes, monthRes, totalRes] = await Promise.all([
      supabase.from("site_visits").select("visitor_id").gte("created_at", todayStart),
      supabase.from("site_visits").select("visitor_id").gte("created_at", weekStart),
      supabase.from("site_visits").select("visitor_id").gte("created_at", monthStart),
      supabase.from("site_visits").select("visitor_id"),
    ]);

    const countUnique = (data: any[] | null) => new Set((data || []).map(d => d.visitor_id).filter(Boolean)).size;

    setOverviewStats({
      today: todayRes.data?.length || 0,
      todayUnique: countUnique(todayRes.data),
      week: weekRes.data?.length || 0,
      weekUnique: countUnique(weekRes.data),
      month: monthRes.data?.length || 0,
      monthUnique: countUnique(monthRes.data),
      total: totalRes.data?.length || 0,
      totalUnique: countUnique(totalRes.data),
    });
  }, []);

  const fetchDaily = useCallback(async () => {
    const { year, month } = selectedMonth;
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data } = await supabase
      .from("site_visits")
      .select("created_at, visitor_id")
      .gte("created_at", start)
      .lte("created_at", end);

    const byDay: Record<string, { visits: number; visitors: Set<string> }> = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      byDay[key] = { visits: 0, visitors: new Set() };
    }

    (data || []).forEach((v) => {
      const day = v.created_at.split("T")[0];
      if (byDay[day]) {
        byDay[day].visits++;
        if (v.visitor_id) byDay[day].visitors.add(v.visitor_id);
      }
    });

    setDailyStats(
      Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, { visits, visitors }]) => ({ date, visits, unique: visitors.size }))
    );
  }, [selectedMonth]);

  const fetchMonthly = useCallback(async () => {
    const start = new Date(selectedYear, 0, 1).toISOString();
    const end = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();

    const { data } = await supabase
      .from("site_visits")
      .select("created_at, visitor_id")
      .gte("created_at", start)
      .lte("created_at", end);

    const byMonth: Record<number, { visits: number; visitors: Set<string> }> = {};
    for (let m = 0; m < 12; m++) {
      byMonth[m] = { visits: 0, visitors: new Set() };
    }

    (data || []).forEach((v) => {
      const m = new Date(v.created_at).getMonth();
      byMonth[m].visits++;
      if (v.visitor_id) byMonth[m].visitors.add(v.visitor_id);
    });

    setMonthlyStats(
      Object.entries(byMonth).map(([m, { visits, visitors }]) => ({
        month: Number(m),
        year: selectedYear,
        visits,
        unique: visitors.size,
      }))
    );
  }, [selectedYear]);

  useEffect(() => {
    if (view === "overview") fetchOverview();
    if (view === "daily") fetchDaily();
    if (view === "monthly") fetchMonthly();
  }, [view, fetchOverview, fetchDaily, fetchMonthly]);

  const prevMonth = () => {
    setSelectedMonth((p) => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 });
  };
  const nextMonth = () => {
    setSelectedMonth((p) => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 });
  };

  const maxVisits = Math.max(...dailyStats.map((d) => d.visits), 1);
  const maxMonthlyVisits = Math.max(...monthlyStats.map((d) => d.visits), 1);

  return (
    <div className="mb-8">
      <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <Eye size={20} className="text-secondary" /> Statistiques visiteurs
      </h2>

      {/* View tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "overview" as const, label: "Aperçu", icon: Eye },
          { key: "daily" as const, label: "Par jour", icon: Calendar },
          { key: "monthly" as const, label: "Par mois", icon: TrendingUp },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={view === key ? "default" : "outline"}
            size="sm"
            onClick={() => setView(key)}
            className={view === key ? "bg-gradient-brand" : ""}
          >
            <Icon size={14} className="mr-1" /> {label}
          </Button>
        ))}
      </div>

      {/* Overview */}
      {view === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Aujourd'hui", visits: overviewStats.today, unique: overviewStats.todayUnique, icon: Calendar },
            { label: "Cette semaine", visits: overviewStats.week, unique: overviewStats.weekUnique, icon: TrendingUp },
            { label: "Ce mois", visits: overviewStats.month, unique: overviewStats.monthUnique, icon: TrendingUp },
            { label: "Total", visits: overviewStats.total, unique: overviewStats.totalUnique, icon: Eye },
          ].map(({ label, visits, unique, icon: Icon }) => (
            <div key={label} className="glass rounded-xl p-4 text-center">
              <Icon size={18} className="mx-auto text-secondary mb-1" />
              <p className="text-2xl font-bold text-gradient">{unique}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <Users size={10} /> visiteurs uniques
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{visits} visites totales</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Daily view */}
      {view === "daily" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft size={18} /></Button>
            <span className="font-display font-bold text-lg">{MONTHS_FR[selectedMonth.month]} {selectedMonth.year}</span>
            <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight size={18} /></Button>
          </div>

          <div className="glass rounded-xl p-4 overflow-x-auto">
            <div className="flex items-end gap-1 min-w-[600px] h-48">
              {dailyStats.map((d) => {
                const dayNum = d.date.split("-")[2];
                const heightPct = (d.visits / maxVisits) * 100;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {d.unique} unique · {d.visits} visites
                    </div>
                    <div
                      className="w-full bg-gradient-brand rounded-t-sm transition-all group-hover:opacity-80"
                      style={{ height: `${Math.max(heightPct, d.visits > 0 ? 4 : 0)}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground mt-1">{dayNum}</span>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="flex gap-6 mt-4 pt-3 border-t border-border justify-center text-sm">
              <span className="text-muted-foreground">
                <Users size={12} className="inline mr-1" />
                <strong className="text-foreground">{dailyStats.reduce((s, d) => s + d.unique, 0)}</strong> visiteurs uniques
              </span>
              <span className="text-muted-foreground">
                <Eye size={12} className="inline mr-1" />
                <strong className="text-foreground">{dailyStats.reduce((s, d) => s + d.visits, 0)}</strong> visites totales
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Monthly view */}
      {view === "monthly" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedYear((y) => y - 1)}><ChevronLeft size={18} /></Button>
            <span className="font-display font-bold text-lg">{selectedYear}</span>
            <Button variant="ghost" size="icon" onClick={() => setSelectedYear((y) => y + 1)}><ChevronRight size={18} /></Button>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-end gap-2 h-48">
              {monthlyStats.map((d) => {
                const heightPct = (d.visits / maxMonthlyVisits) * 100;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="absolute -top-8 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {d.unique} unique · {d.visits} visites
                    </div>
                    <div
                      className="w-full bg-gradient-brand rounded-t-sm transition-all group-hover:opacity-80"
                      style={{ height: `${Math.max(heightPct, d.visits > 0 ? 4 : 0)}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground mt-1">{MONTHS_FR[d.month].substring(0, 3)}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-6 mt-4 pt-3 border-t border-border justify-center text-sm">
              <span className="text-muted-foreground">
                <Users size={12} className="inline mr-1" />
                <strong className="text-foreground">{monthlyStats.reduce((s, d) => s + d.unique, 0)}</strong> visiteurs uniques
              </span>
              <span className="text-muted-foreground">
                <Eye size={12} className="inline mr-1" />
                <strong className="text-foreground">{monthlyStats.reduce((s, d) => s + d.visits, 0)}</strong> visites totales
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVisitStats;
