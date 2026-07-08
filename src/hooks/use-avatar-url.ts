import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns a signed URL for a stored avatar path in the private `avatars`
 * bucket. Refreshes before expiry.
 */
export function useAvatarUrl(path: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl(null);
      return;
    }
    supabase.storage
      .from("avatars")
      .createSignedUrl(path, 60 * 60)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setUrl(null);
        } else {
          setUrl(data.signedUrl);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return url;
}
