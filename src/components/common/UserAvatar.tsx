import { useState } from "react";

const SIZE_CLASSES = {
  xs: "h-8 w-8 text-xs",
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
} as const;

export function UserAvatar({
  src,
  name,
  alt = "",
  size = "md",
  className = "",
  loading = "lazy",
}: {
  src?: string | null;
  name: string;
  alt?: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  loading?: "eager" | "lazy";
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const showImage = Boolean(src) && src !== failedSource;
  const fallback = name.trim().slice(0, 2).toLocaleUpperCase() || "?";

  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-secondary font-semibold text-foreground ${SIZE_CLASSES[size]} ${className}`}
    >
      {showImage ? (
        <img
          src={src!}
          alt=""
          loading={loading}
          className="h-full w-full object-cover"
          onError={() => setFailedSource(src!)}
        />
      ) : (
        <span aria-hidden="true">{fallback}</span>
      )}
    </span>
  );
}
