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

export function stripHtml(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&rsquo;/g, "'");
  text = text.replace(/&lsquo;/g, "'");
  text = text.replace(/&rdquo;/g, '"');
  text = text.replace(/&ldquo;/g, '"');
  text = text.replace(/&hellip;/g, '…');
  // Collapse multiple spaces/newlines
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}
