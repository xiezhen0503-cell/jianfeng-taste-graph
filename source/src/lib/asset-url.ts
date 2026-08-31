/** Prefix public-folder assets when the static app is hosted under GitHub Pages. */
export function assetUrl(path: string) {
  if (!path || /^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!base || path.startsWith(`${base}/`)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
