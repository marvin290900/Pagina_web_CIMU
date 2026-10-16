import DOMPurify from 'dompurify';
// Rendering runs in Vue's browser preview. SSR receives no unsanitized fallback.
export function sanitizeHtml(html) {
  if (typeof window === 'undefined') return '';
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe'], FORBID_ATTR: ['style'], ALLOW_DATA_ATTR: false });
}
