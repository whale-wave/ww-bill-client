export function getImagePreviewStatusImage(label: string) {
  const safeLabel = label.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&apos;',
  })[character] ?? character);

  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160"><text x="160" y="80" fill="white" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle">${safeLabel}</text></svg>`)}`;
}
