/**
 * src/utils/dateUtils.ts
 * Utility functions for date manipulation and formatting
 */

/**
 * Add days to a date
 * @param date The date to add days to
 * @param days Number of days to add
 * @returns A new date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 * @param date The date to add months to
 * @param months Number of months to add
 * @returns A new date with months added
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 * @param date The date to add years to
 * @param years Number of years to add
 * @returns A new date with years added
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Get the difference in days between two dates
 * @param date1 First date
 * @param date2 Second date
 * @returns Number of days between dates
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  // Convert to UTC to avoid timezone and DST issues
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}

/**
 * Check if a date is today
 * @param date Date to check
 * @returns True if date is today, false otherwise
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Check if a date is in the past
 * @param date Date to check
 * @returns True if date is in the past, false otherwise
 */
export function isPast(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}

/**
 * Check if a date is in the future
 * @param date Date to check
 * @returns True if date is in the future, false otherwise
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > new Date().getTime();
}

/**
 * Get the start of a day (midnight)
 * @param date Date to get start of day for
 * @returns Date set to start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of a day (23:59:59.999)
 * @param date Date to get end of day for
 * @returns Date set to end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get the start of a month
 * @param date Date to get start of month for
 * @returns Date set to start of month
 */
export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of a month
 * @param date Date to get end of month for
 * @returns Date set to end of month
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get ISO date string (YYYY-MM-DD)
 * @param date Date to format
 * @returns ISO format date string
 */
export function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse date string to Date object
 * @param dateString Date string to parse
 * @returns Date object or null if invalid
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  
  // Check if valid date
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
}

/**
 * Format a date as a locale string (e.g., "1/15/2023")
 * @param date Date to format
 * @param locale Locale to use (default: user's locale)
 * @returns Formatted date string
 */
export function formatDate(date: Date | null | undefined, locale?: string): string {
  if (!date) return '';
  
  try {
    return date.toLocaleDateString(locale);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a date to include time (e.g., "1/15/2023, 3:30 PM")
 * @param date Date to format
 * @param locale Locale to use (default: user's locale)
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | null | undefined, locale?: string): string {
  if (!date) return '';
  
  try {
    return date.toLocaleString(locale);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return '';
  }
}

/**
 * Get relative time string (e.g., "3 days ago", "in 5 hours")
 * @param date Date to get relative time for
 * @returns Relative time string
 */
export function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);
  
  if (Math.abs(diffDays) >= 7) {
    return formatDate(date);
  } else if (diffDays > 1) {
    return `in ${diffDays} days`;
  } else if (diffDays === 1) {
    return 'tomorrow';
  } else if (diffHr > 0) {
    return `in ${diffHr} hour${diffHr > 1 ? 's' : ''}`;
  } else if (diffMin > 0) {
    return `in ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
  } else if (diffSec > 0) {
    return `in ${diffSec} second${diffSec > 1 ? 's' : ''}`;
  } else if (diffSec > -60) {
    return 'just now';
  } else if (diffMin > -60) {
    return `${Math.abs(diffMin)} minute${Math.abs(diffMin) > 1 ? 's' : ''} ago`;
  } else if (diffHr > -24) {
    return `${Math.abs(diffHr)} hour${Math.abs(diffHr) > 1 ? 's' : ''} ago`;
  } else if (diffDays === -1) {
    return 'yesterday';
  } else {
    return `${Math.abs(diffDays)} days ago`;
  }
}

/**
 * Creates a date range array from start to end (inclusive)
 * @param startDate Start date
 * @param endDate End date
 * @returns Array of dates
 */
export function getDateRangeArray(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
}

/**
 * Gets the day name (Monday, Tuesday, etc.)
 * @param date Date to get day name for
 * @param locale Locale to use
 * @param short Use short format (Mon, Tue, etc.)
 * @returns Day name
 */
export function getDayName(date: Date, locale?: string, short = false): string {
  const options: Intl.DateTimeFormatOptions = { weekday: short ? 'short' : 'long' };
  return date.toLocaleDateString(locale, options);
}

/**
 * Gets the month name (January, February, etc.)
 * @param date Date to get month name for
 * @param locale Locale to use
 * @param short Use short format (Jan, Feb, etc.)
 * @returns Month name
 */
export function getMonthName(date: Date, locale?: string, short = false): string {
  const options: Intl.DateTimeFormatOptions = { month: short ? 'short' : 'long' };
  return date.toLocaleDateString(locale, options);
} 