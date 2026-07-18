import { useState, useEffect } from "react";

/**
 * Hook to check if the component has mounted on the client.
 * This is useful for avoiding hydration mismatches when rendering
 * components that depend on client-side state (like localStorage or Zustand persist).
 *
 * @returns {boolean} true if the component has mounted, false otherwise.
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
