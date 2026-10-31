import { useEffect, useState } from "react";
import { fetchPrivateImage } from "@/services/chatApi";

export function PrivateChatImage({ url, alt }: { url: string; alt: string }) {
  const [source, setSource] = useState<string>();
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    void fetchPrivateImage(url, controller.signal)
      .then((result) => {
        objectUrl = result;
        setSource(result);
      })
      .catch(() => setSource(undefined));
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);
  return source ? (
    <img
      src={source}
      alt={alt}
      loading="lazy"
      className="max-h-80 max-w-full rounded-lg object-contain"
    />
  ) : (
    <span
      className="inline-block h-32 w-48 animate-pulse rounded-lg bg-muted"
      aria-label={alt}
    />
  );
}
