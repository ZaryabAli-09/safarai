/**
 * Input sanitization and validation utilities
 * Prevents injection attacks and XSS vulnerabilities
 */

/**
 * Sanitize string input by removing potentially harmful characters
 * and limiting length
 */
export function sanitizeString(input: string, maxLength: number = 5000): string {
  if (!input || typeof input !== "string") {
    return "";
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'`]/g, ""); // Remove potentially harmful characters
}

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(
  input: any[],
  maxLength: number = 500,
  maxItems: number = 50
): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .slice(0, maxItems)
    .map((item) => sanitizeString(item, maxLength))
    .filter((item) => item.length > 0);
}

/**
 * Validate budget (should be positive number)
 */
export function validateBudget(budget: any): number | null {
  const parsed = parseFloat(budget);
  if (isNaN(parsed) || parsed <= 0 || parsed > 10000000) {
    return null;
  }
  return Math.round(parsed);
}

/**
 * Validate duration (should be between 1-30 days)
 */
export function validateDuration(duration: any): number | null {
  const parsed = parseInt(duration, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 30) {
    return null;
  }
  return parsed;
}

/**
 * Validate date string
 */
export function validateDate(dateString: any): Date | null {
  if (!dateString || typeof dateString !== "string") {
    return null;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }

  // Date should not be in the past
  if (date < new Date()) {
    return null;
  }

  return date;
}

/**
 * Validate email format
 */
export function validateEmail(email: any): string | null {
  if (!email || typeof email !== "string") {
    return null;
  }

  const sanitized = sanitizeString(email, 255);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitize AI prompt to prevent injection attacks
 */
export function sanitizeAiPrompt(tripDetails: any): any {
  return {
    name: sanitizeString(tripDetails.name, 200),
    destinations: sanitizeStringArray(tripDetails.destinations, 100, 10),
    startDate: validateDate(tripDetails.startDate),
    endDate: validateDate(tripDetails.endDate),
    duration: validateDuration(tripDetails.duration),
    budget: validateBudget(tripDetails.budget),
    tripType: sanitizeString(tripDetails.tripType, 100),
    transportation: sanitizeString(tripDetails.transportation, 100),
    accommodation: sanitizeString(tripDetails.accommodation, 100),
    tripPace: sanitizeString(tripDetails.tripPace, 100),
    specialOccasion: sanitizeString(tripDetails.specialOccasion, 200),
    interests: sanitizeStringArray(tripDetails.interests, 50, 20),
    diningPreferences: sanitizeStringArray(tripDetails.diningPreferences, 50, 20),
  };
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
