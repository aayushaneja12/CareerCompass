import { useEffect, useMemo, useState } from "react";
import BackToHomeButton from "../components/BackToHomeButton";
import { supabase } from "../integrations/supabase/client";

type AttendanceStatus = "attended" | "going" | "interested" | "not_going" | string;

type AttendanceItem = {
  event_id: string;
  user_id: string;
  status: AttendanceStatus;
  updated_at: string;
  events?: {
    id: string;
    title: string;
    start_time: string;
    end_time: string | null;
    location: string | null;
    description?: string | null;
  } | null;
};

const statusPill = (status: AttendanceStatus) => {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border";

  switch (status) {
    case "attended":
      return `${base} bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.35)]`;
    case "going":
      return `${base} bg-emerald-500/10 text-emerald-300 border-emerald-500/30`;
    case "interested":
      return `${base} bg-sky-500/10 text-sky-300 border-sky-500/30`;
    case "not_going":
      return `${base} bg-red-500/10 text-red-300 border-red-500/30`;
    default:
      return `${base} bg-white/5 text-[hsl(var(--foreground))] border-[hsl(var(--border))]`;
  }
};

const prettyStatus = (s: AttendanceStatus) => {
  if (!s) return "—";
  return String(s).replace(/_/g, " ");

};

const Attendance = () => {
  const [rows, setRows] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      // 1) get logged-in user
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) {
        setError(authErr?.message || "Not logged in.");
        setRows([]);
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // 2) fetch ONLY this user's attendance + join event details
      // If your relation name isn't "events", change `events(...)` accordingly.
      // Supabase select string uses runtime parsing; TS cannot infer this correctly

      const { data, error: qErr } = await supabase
        .from("attendance")
        .select(
          `
          event_id,
          user_id,
          status,
          updated_at,
          events (
            id,
            title,
            start_time,
            end_time,
            location,
            description
          )
        `
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (qErr) {
        setError(qErr.message);
        setRows([]);
      } else {
        setRows((data as any) ?? []);
      }

      setLoading(false);
    };

    load();
  }, []);

  const upcoming = useMemo(() => {
    return rows
      .filter((r) => r.events?.start_time && new Date(r.events.start_time) >= now)
      .sort(
        (a, b) =>
          new Date(a.events!.start_time).getTime() -
          new Date(b.events!.start_time).getTime()
      );
  }, [rows, now]);

  const past = useMemo(() => {
    return rows
      .filter((r) => r.events?.start_time && new Date(r.events.start_time) < now)
      .sort(
        (a, b) =>
          new Date(b.events!.start_time).getTime() -
          new Date(a.events!.start_time).getTime()
      );
  }, [rows, now]);

  const Card = ({ item }: { item: AttendanceItem }) => {
    const e = item.events;

    return (
      <div
        className={[
          "p-5 rounded-2xl",
          "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
          "hover:border-[hsl(var(--primary))] hover:gold-glow transition-smooth",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-[hsl(var(--foreground))] truncate">
              {e?.title ?? "Untitled event"}
            </div>

            {e?.start_time && (
              <div className="text-sm opacity-80 mt-1">
                {new Date(e.start_time).toLocaleString()}
                {e.end_time ? (
                  <> → {new Date(e.end_time).toLocaleString()}</>
                ) : null}
              </div>
            )}
          </div>

          <span className={statusPill(item.status)}>{prettyStatus(item.status)}</span>
        </div>

        {e?.location ? (
          <div className="text-sm mt-3 opacity-90">📍 {e.location}</div>
        ) : null}

        {e?.description ? (
          <div className="text-sm mt-2 opacity-90 leading-relaxed">
            {e.description}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            My Attendance
          </h1>
          <p className="text-sm opacity-80 mt-1">
            Your event responses, grouped by what’s coming up vs what’s done.
          </p>
        </div>

        <BackToHomeButton />
      </div>

      {error ? (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="opacity-80">Loading attendance…</div>
      ) : rows.length === 0 ? (
        <div className="opacity-80">No attendance records found.</div>
      ) : (
        <div className="space-y-10">
          {/* Upcoming */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xl font-semibold">Upcoming</h2>
              <span className="text-sm opacity-70">{upcoming.length} items</span>
            </div>

            {upcoming.length === 0 ? (
              <div className="opacity-70">No upcoming attendance records.</div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((item) => (
                  <Card
                    key={`${item.user_id}-${item.event_id}`}
                    item={item}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Past */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xl font-semibold">Past</h2>
              <span className="text-sm opacity-70">{past.length} items</span>
            </div>

            {past.length === 0 ? (
              <div className="opacity-70">No past attendance records.</div>
            ) : (
              <div className="space-y-4">
                {past.map((item) => (
                  <Card
                    key={`${item.user_id}-${item.event_id}`}
                    item={item}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Attendance;
