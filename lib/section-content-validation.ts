/** Shared, dependency-free CMS section content checks. Public and admin rendering only accept approved destinations. */
export type SectionInput = { section_type: string; content: Record<string, unknown> };
const internalPath = /^\/(?!\/)[\w\-/?.#%=&]*$/;
export function isApprovedContentUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const url = value.trim();
  if (!url || url.length > 2048 || /[\u0000-\u001f\u007f]/.test(url)) return false;
  if (internalPath.test(url)) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !!parsed.hostname && !parsed.username && !parsed.password;
  } catch { return false; }
}
function text(value: unknown): string { return typeof value === 'string' ? value.trim() : ''; }
export function validateSectionContent(section: SectionInput): string | null {
  const c = section.content;
  const hasUrl = (key: string) => c[key] != null && c[key] !== '';
  if (hasUrl('href') && !isApprovedContentUrl(c.href)) return 'Invalid section button URL. Use an internal /path or HTTPS link.';
  if (hasUrl('imageUrl')) {
    if (!isApprovedContentUrl(c.imageUrl)) return 'Invalid section image URL. Use an internal /path or HTTPS link.';
    if (!text(c.imageAlt)) return 'Image alt text is required for section images.';
  }
  if (['CARDS','PROJECTS','FAQ','STATS'].includes(section.section_type)) {
    if (c.items != null && !Array.isArray(c.items)) return 'Section items must be a list.';
    const items = c.items as unknown[] | undefined;
    if (items && items.length > 48) return 'Maximum 48 items per section.';
    for (const [index,item] of (items || []).entries()) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return `Item ${index+1} must be an object.`;
      const row = item as Record<string, unknown>;
      if (row.href != null && row.href !== '' && !isApprovedContentUrl(row.href)) return `Item ${index+1} has an invalid link.`;
      if (row.imageUrl != null && row.imageUrl !== '') {
        if (!isApprovedContentUrl(row.imageUrl)) return `Item ${index+1} has an invalid image URL.`;
        if (!text(row.imageAlt)) return `Item ${index+1} image needs alt text.`;
      }
    }
  }
  return null;
}
