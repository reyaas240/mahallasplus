export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  if (url.includes('blob.vercel-storage.com')) {
    return `/api/files/proxy?url=${encodeURIComponent(url)}`;
  }
  
  return url;
}

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
