/**
 * src/utils/formatting.ts
 * Utility functions for formatting data
 */

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: EUR)
 * @param locale The locale for formatting (default: current browser locale)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale?: string
): string {
  if (amount === null || amount === undefined) {
    return '';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Format a date object to string
 * @param date The date to format
 * @param format The format style ('short', 'medium', 'long', 'full')
 * @param locale The locale for formatting (default: current browser locale)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | null | undefined,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale?: string
): string {
  if (!date) {
    return '';
  }

  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: format }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    // Fallback format: MM/DD/YYYY
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }
}

/**
 * Truncate text to a specific length with ellipsis
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text || '';
  }

  return `${text.slice(0, maxLength)}...`;
}

/**
 * Capitalize the first letter of each word in a string
 * @param text The text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format phone number to a standardized format
 * @param phoneNumber The phone number to format
 * @param countryCode The country code (default: '+34' for Spain)
 * @returns Formatted phone number
 */
export function formatPhoneNumber(
  phoneNumber: string,
  countryCode: string = '+34'
): string {
  if (!phoneNumber) {
    return '';
  }

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // Add country code if not present
  let formattedNumber = digits;
  if (!digits.startsWith('34') && !digits.startsWith('+34')) {
    formattedNumber = countryCode.replace('+', '') + digits;
  }

  // Format as +XX XXX XXX XXX
  if (formattedNumber.length === 11) { // Spanish numbers (34 + 9 digits)
    return `+${formattedNumber.slice(0, 2)} ${formattedNumber.slice(2, 5)} ${formattedNumber.slice(5, 8)} ${formattedNumber.slice(8)}`;
  }

  // Return with country code for any other format
  return `+${formattedNumber}`;
}

/**
 * Format a file size into a human-readable string
 * @param bytes The file size in bytes
 * @returns A formatted string representation of the file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format a number with thousand separators
 * @param value The number to format
 * @param decimals Number of decimal places (default: 2)
 * @param decimalSeparator Decimal separator (default: '.')
 * @param thousandSeparator Thousand separator (default: ',')
 * @returns Formatted number as string
 */
export function formatNumber(
  value: number,
  decimals = 2,
  decimalSeparator = '.',
  thousandSeparator = ','
): string {
  // Handle special cases
  if (isNaN(value)) return 'N/A';
  if (!isFinite(value)) return value > 0 ? '∞' : '-∞';
  
  // Format the value
  const fixed = value.toFixed(decimals);
  const [intPart, decimalPart] = fixed.split('.');
  
  // Add thousand separators
  const formattedIntPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  
  // Combine parts
  return decimalPart 
    ? `${formattedIntPart}${decimalSeparator}${decimalPart}`
    : formattedIntPart;
}

/**
 * Format a percentage value
 * @param value The value to format as percentage (e.g., 0.15 for 15%)
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage as string
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${formatNumber(value * 100, decimals)}%`;
}

/**
 * Format a duration in milliseconds to a human-readable string
 * @param durationMs Duration in milliseconds
 * @param includeMs Whether to include milliseconds in the output
 * @returns Formatted duration string
 */
export function formatDuration(durationMs: number, includeMs = false): string {
  const ms = durationMs % 1000;
  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const hours = Math.floor((durationMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  
  const parts = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || (parts.length === 0 && !includeMs)) parts.push(`${seconds}s`);
  if (includeMs && ms > 0) parts.push(`${ms}ms`);
  
  return parts.join(' ') || '0s';
} 