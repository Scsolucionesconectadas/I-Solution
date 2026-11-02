export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const jsonScript = value => JSON.stringify(value).replace(/</g, '\\u003c');
export const plainText = value => String(value ?? '').replace(/\*\*/g, '').replace(/\n/g, ' ').trim();
export const richText = value => escapeHtml(value).replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
export const headingText = value => richText(value).replace(/\n/g, '<br>');
export const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
