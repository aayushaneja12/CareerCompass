import { supabase } from "@/integrations/supabase/client";

export type EventRow = {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  description: string | null;
};

export async function fetchEvents(nowISO = new Date().toISOString()): Promise<EventRow[]> {
  // Cast to any to avoid the “Invalid Relationships cannot infer result type” typing issue
  const { data, error } = await (supabase as any)
    .from("events")
    .select("id,title,start_time,end_time,location,description")
    .gte("start_time", nowISO)
    .order("start_time", { ascending: true });

  if (error) throw error;

  return (data ?? []) as EventRow[];
}
