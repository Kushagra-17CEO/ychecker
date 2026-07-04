/**
 * Utility: sanitize HTML from user input before sending to Gemini API
 * See Blueprint Section 10.4
 */
export function sanitizeInput(input: string): string {
  // Dynamically import sanitize-html at runtime (server-side only)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sanitizeHtml = require('sanitize-html')
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  })
}
