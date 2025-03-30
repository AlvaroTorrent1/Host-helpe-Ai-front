/**
 * src/utils/textUtils.ts
 * Utility functions for text manipulation and formatting
 */

/**
 * Truncates a string to a specified length, adding an ellipsis if truncated
 * @param text The string to truncate
 * @param maxLength The maximum allowed length
 * @param ellipsis The ellipsis string to use
 * @returns The truncated string
 */
export function truncate(text: string, maxLength: number, ellipsis = '...'): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalizes the first letter of a string
 * @param text The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Capitalizes the first letter of each word in a string
 * @param text The string to capitalize
 * @returns The string with each word capitalized
 */
export function titleCase(text: string): string {
  if (!text) return text;
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts a string to camelCase
 * @param text The string to convert
 * @returns The camelCase string
 */
export function camelCase(text: string): string {
  if (!text) return text;
  return text
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, firstChar => firstChar.toLowerCase());
}

/**
 * Converts a string to snake_case
 * @param text The string to convert
 * @returns The snake_case string
 */
export function snakeCase(text: string): string {
  if (!text) return text;
  return text
    .replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
    .replace(/^_/, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/**
 * Converts a string to kebab-case
 * @param text The string to convert
 * @returns The kebab-case string
 */
export function kebabCase(text: string): string {
  if (!text) return text;
  return text
    .replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Removes accents/diacritics from a string
 * @param text The string to normalize
 * @returns The normalized string without accents
 */
export function removeAccents(text: string): string {
  if (!text) return text;
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Strips all HTML tags from a string
 * @param html The HTML string to strip
 * @returns The plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return html;
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Masks a portion of a string with a masking character
 * @param text The string to mask
 * @param startPos Starting position for masking (0-based)
 * @param endPos Ending position for masking (0-based)
 * @param maskChar Character to use for masking
 * @returns The masked string
 */
export function maskString(
  text: string, 
  startPos: number, 
  endPos: number, 
  maskChar = '*'
): string {
  if (!text) return text;
  if (startPos < 0) startPos = 0;
  if (endPos >= text.length) endPos = text.length - 1;

  const start = text.substring(0, startPos);
  const mask = maskChar.repeat(endPos - startPos + 1);
  const end = text.substring(endPos + 1);
  
  return start + mask + end;
}

/**
 * Generates a slug from a string (URL-friendly version)
 * @param text The string to convert to a slug
 * @returns The slug
 */
export function slugify(text: string): string {
  if (!text) return text;
  return removeAccents(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')    // Remove special characters
    .replace(/[\s_-]+/g, '-')     // Replace spaces, underscores and hyphens with a single hyphen
    .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
}

/**
 * Escapes a string for safe use in regular expressions
 * @param text The string to escape
 * @returns The escaped string
 */
export function escapeRegExp(text: string): string {
  if (!text) return text;
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Formats a number as a currency string
 * @param amount The amount to format
 * @param currency The currency code (default: EUR)
 * @param locale The locale to use (default: es-ES)
 * @returns The formatted currency string
 */
export function formatCurrency(
  amount: number, 
  currency = 'EUR', 
  locale = 'es-ES'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Generates initials from a name string
 * @param name The full name
 * @param maxLength Maximum number of initials to return
 * @returns The initials string
 */
export function getInitials(name: string, maxLength = 2): string {
  if (!name) return '';
  
  const parts = name.split(/\s+/);
  const initials = parts.map(part => part.charAt(0).toUpperCase());
  
  return initials.slice(0, maxLength).join('');
} 