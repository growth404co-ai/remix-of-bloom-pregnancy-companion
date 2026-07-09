import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves a product image reference to a displayable URL.
 * - If value is a full http(s) URL, returns it as-is.
 * - Otherwise treats it as a storage path in the private `product-images`
 *   bucket and returns a signed URL.
 */
export function useProductImageUrl(value: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!value) {
      setUrl(null);
      return;
    }
    if (/^https?:\/\//i.test(value)) {
      setUrl(value);
      return;
    }
    supabase.storage
      .from("product-images")
      .createSignedUrl(value, 60 * 60)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) setUrl(null);
        else setUrl(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  return url;
}
