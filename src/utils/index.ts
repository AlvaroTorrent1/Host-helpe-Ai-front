/**
 * src/utils/index.ts
 * Central export point for commonly used utility functions
 */

// Common utilities
export { tryCatch, debounce, throttle, delay, isEmpty, isNil, deepClone } from './commonUtils';

// Date utilities
export { formatDate, formatDateTime, isToday, addDays, addMonths, getDaysDifference } from './dateUtils';

// Validation utilities
export { isValidEmail, validatePasswordStrength, isValidPhoneNumber, isValidUrl } from './validation';

// Storage utilities
export { getStorage } from './storageUtils';

// String utilities
export { capitalize, truncate } from './stringUtils';

// Formatting utilities
export { formatFileSize, formatNumber, formatPercent, formatDuration } from './formatting'; 