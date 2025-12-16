import { useEffect, useMemo, useState } from "react";
import BackToHomeButton from "../components/BackToHomeButton";
import { supabase } from "../integrations/supabase/client";

type FaqRow = {
  id: string;
  question: string | null;
  answer: string | null;
  tags: string[] | null; // your DB shows tags as _text (Postgres text[])
  is_published: boolean | null;
  updated_at: string | null;
};

const pill =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

const Faq = () => {
  const [rows, setRows] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const text = `${r.question ?? ""} ${r.answer ?? ""} ${(r.tags ?? []).join(" ")}`.toLowerCase();
      return text.includes(q);
    });
  }, [rows, query]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("faq")
        .select("id, question, answer, tags, is_published, updated_at")
        .eq("is_published", true)
        .order("updated_at", { ascending: false });

      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        setRows((data as any) ?? []);
      }

      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="p-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">FAQ</h1>
          <p className="text-sm opacity-80 mt-1">
            Quick answers about PRP, attendance, badges, quizzes, and Mentra.
          </p>
        </div>

        {/* Reusable back button */}
        <BackToHomeButton />
      </div>

      {/* Search bar */}
      <div className="mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQs (e.g., attendance, badges, quizzes)..."
          className="w-full max-w-xl rounded-lg border border-[hsl(var(--border))]
                     bg-[hsl(var(--card))] px-4 py-3 outline-none
                     focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="opacity-80">Loading FAQs...</div>
      ) : filtered.length === 0 ? (
        <div className="opacity-80">No FAQs found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <details
              key={f.id}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
            >
              <summary className="cursor-pointer select-none list-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">
                      {f.question ?? "Untitled question"}
                    </div>

                    {/* tags */}
                    {(f.tags ?? []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(f.tags ?? []).slice(0, 6).map((t, idx) => (
                          <span
                            key={`${f.id}-tag-${idx}`}
                            className={`${pill} bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/25`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span
                    className={`${pill} bg-white/5 text-[hsl(var(--foreground))] border-[hsl(var(--border))]`}
                  >
                    View
                  </span>
                </div>
              </summary>

              <div className="mt-3 border-t border-[hsl(var(--border))] pt-3 opacity-90 leading-relaxed">
                {f.answer ?? "No answer provided yet."}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
};

export default Faq;
