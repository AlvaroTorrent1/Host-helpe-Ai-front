/**
 * src/utils/stringUtils.ts
 * Utility functions for string manipulation
 */

/**
 * Capitalizes the first letter of a string
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalizes the first letter of each word in a string
 * @param str The string to transform
 * @returns The transformed string with each word capitalized
 */
export function titleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncates a string to a specified length and adds an ellipsis if truncated
 * @param str The string to truncate
 * @param maxLength The maximum length of the string
 * @param suffix The suffix to add if truncated (default: '...')
 * @returns The truncated string
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (!str) return str;
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + suffix;
}

/**
 * Removes all HTML tags from a string
 * @param html The HTML string
 * @returns The string with HTML tags removed
 */
export function stripHtml(html: string): string {
  if (!html) return html;
  return html.replace(/<[^>]*>?/gm, '');
}

/**
 * Converts a string to camelCase
 * @param str The string to convert
 * @returns The camelCase string
 */
export function toCamelCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

/**
 * Converts a string to kebab-case
 * @param str The string to convert
 * @returns The kebab-case string
 */
export function toKebabCase(str: string): string {
  if (!str) return str;
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to snake_case
 * @param str The string to convert
 * @returns The snake_case string
 */
export function toSnakeCase(str: string): string {
  if (!str) return str;
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Converts a string to a slug (URL-friendly string)
 * @param str The string to convert
 * @returns The slug
 */
export function slugify(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove non-word chars
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/**
 * Escapes special regex characters in a string
 * @param str The string to escape
 * @returns The escaped string
 */
export function escapeRegExp(str: string): string {
  if (!str) return str;
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Formats a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: 'USD')
 * @param locale The locale (default: 'en-US')
 * @returns The formatted currency string
 */
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Formats a number with thousand separators
 * @param number The number to format
 * @param locale The locale (default: 'en-US')
 * @returns The formatted number string
 */
export function formatNumber(number: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(number);
}

/**
 * Formats a number as a percentage
 * @param number The number to format (0.1 = 10%)
 * @param locale The locale (default: 'en-US')
 * @param decimals The number of decimal places (default: 0)
 * @returns The formatted percentage string
 */
export function formatPercent(number: number, locale = 'en-US', decimals = 0): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes The file size in bytes
 * @param decimals The number of decimal places (default: 2)
 * @returns The formatted file size string
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Gets the initials from a name (e.g., "John Doe" -> "JD")
 * @param name The name to get initials from
 * @param maxInitials Maximum number of initials to return (default: 2)
 * @returns The initials
 */
export function getInitials(name: string, maxInitials = 2): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .filter(char => char.match(/[A-Z]/i))
    .slice(0, maxInitials)
    .join('')
    .toUpperCase();
}

/**
 * Generates a random string of specified length
 * @param length The length of the string to generate (default: 8)
 * @param includeSpecialChars Whether to include special characters (default: false)
 * @returns The random string
 */
export function generateRandomString(length = 8, includeSpecialChars = false): string {
  const charset = includeSpecialChars
    ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
  let result = '';
  const charactersLength = charset.length;
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * Checks if a string has at least one uppercase letter
 * @param str The string to check
 * @returns True if the string has at least one uppercase letter
 */
export function hasUpperCase(str: string): boolean {
  return /[A-Z]/.test(str);
}

/**
 * Checks if a string has at least one lowercase letter
 * @param str The string to check
 * @returns True if the string has at least one lowercase letter
 */
export function hasLowerCase(str: string): boolean {
  return /[a-z]/.test(str);
}

/**
 * Checks if a string has at least one number
 * @param str The string to check
 * @returns True if the string has at least one number
 */
export function hasNumber(str: string): boolean {
  return /[0-9]/.test(str);
}

/**
 * Checks if a string has at least one special character
 * @param str The string to check
 * @returns True if the string has at least one special character
 */
export function hasSpecialChar(str: string): boolean {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);
}

/**
 * Removes accents from a string
 * @param str The string to normalize
 * @returns The string without accents
 */
export function removeAccents(str: string): string {
  if (!str) return str;
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
} 