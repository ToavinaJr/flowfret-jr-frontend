export function readPasswordResetToken(
  search: string,
  hash: string,
): string | null {
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
  return (
    new URLSearchParams(fragment).get("token") ??
    new URLSearchParams(search).get("token")
  );
}
