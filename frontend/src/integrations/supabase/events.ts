import { supabase } from "../../lib/supabaseClient";

export async function fetchEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .limit(5);

  if (error) throw error;
  return data ?? [];
}
