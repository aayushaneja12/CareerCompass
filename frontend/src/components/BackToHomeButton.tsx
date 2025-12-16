import { useNavigate } from "react-router-dom";

export default function BackToHomeButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className={[
        "inline-flex items-center gap-2",
        "rounded-lg px-4 py-2 text-sm font-medium",
        "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
        "text-[hsl(var(--foreground))]",
        "hover:border-[hsl(var(--primary))] hover:gold-glow transition-smooth",
      ].join(" ")}
    >
      ← Back to Home
    </button>
  );
}

