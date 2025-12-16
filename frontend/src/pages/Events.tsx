import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type EventRow = {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  description: string | null;
}

const formatDT = (iso: string) => {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
};

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nowISO = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("events" as any)
        .select("id,title,start_time,end_time,location,description")
        .gte("start_time", nowISO)
        .order("start_time", { ascending: true });


      if (error) {
        setError(error.message);
        setEvents([]);
      } else {
        setEvents(data ?? []);
      }

      setLoading(false);
    };

    fetchEvents();
  }, [nowISO]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="container py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center gold-glow">
              <Calendar className="w-6 h-6 text-[hsl(var(--primary-foreground))]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-glow">Upcoming Events</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Workshops, networking, PRP sessions, and what’s next.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-[hsl(var(--destructive))] bg-[hsl(var(--card))] p-4">
            <p className="text-sm text-[hsl(var(--destructive))]">
              Couldn’t load events: {error}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 animate-pulse"
              >
                <div className="h-5 w-64 rounded bg-[hsl(var(--muted))]" />
                <div className="mt-3 h-4 w-72 rounded bg-[hsl(var(--muted))]" />
                <div className="mt-2 h-4 w-56 rounded bg-[hsl(var(--muted))]" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          // Empty state
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-[hsl(var(--primary))] mx-auto mb-4 flex items-center justify-center gold-glow">
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-lg font-semibold">No upcoming events yet</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Add a few rows in Supabase to see them here.
            </p>
          </div>
        ) : (
          // List
          <div className="space-y-5">
            {events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-smooth",
                  "hover:border-[hsl(var(--primary))] hover:gold-glow"
                )}
              >
                <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
                  {event.title}
                </h2>

                <div className="mt-3 flex flex-col gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatDT(event.start_time)}
                      {event.end_time ? ` → ${formatDT(event.end_time)}` : ""}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.description && (
                    <p className="mt-1 text-[hsl(var(--foreground))] opacity-90 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
