import { useEffect, useState } from "react";

const SIDEBAR_COLLAPSED_KEY = "careercompass.sidebar.collapsed";

export function useSidebarState() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const raw = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return raw === "true";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return { isSidebarCollapsed, setIsSidebarCollapsed };
}
