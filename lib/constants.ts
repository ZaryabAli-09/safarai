/**
 * Application Constants
 * Centralized configuration and magic strings
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest",
} as const;

// Authentication
export const AUTH = {
  OTP_EXPIRY_MINUTES: 10,
  OTP_LENGTH: 6,
  PASSWORD_RESET_EXPIRY_MINUTES: 15,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SESSION_EXPIRY_DAYS: 30,
} as const;

// Trip Constraints
export const TRIP = {
  MIN_DURATION_DAYS: 1,
  MAX_DURATION_DAYS: 30,
  MAX_DESTINATIONS: 10,
  MIN_BUDGET: 1000, // PKR
  MAX_BUDGET: 10000000, // PKR
  MAX_TRIP_NAME_LENGTH: 200,
  MAX_DESTINATION_LENGTH: 100,
  MAX_AI_NOTES_LENGTH: 5000,
  PAGINATION_DEFAULT_LIMIT: 10,
  PAGINATION_MAX_LIMIT: 50,
} as const;

// Input Validation
export const VALIDATION = {
  MAX_STRING_LENGTH: 5000,
  MAX_EMAIL_LENGTH: 255,
  MAX_ARRAY_ITEMS: 50,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  USERNAME_REGEX: /^[a-zA-Z0-9_-]{3,50}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DATE_FORMAT: "YYYY-MM-DD",
} as const;

// Cache Durations (in seconds)
export const CACHE = {
  PROFILE: 300, // 5 minutes
  TRIPS_LIST: 60, // 1 minute
  TRIP_DETAIL: 600, // 10 minutes
} as const;

// Email Templates
export const EMAIL = {
  VERIFICATION_EXPIRY_MINUTES: 10,
  RESET_EXPIRY_MINUTES: 15,
  MAX_SEND_ATTEMPTS: 3,
  SEND_COOLDOWN_MINUTES: 2,
} as const;

// Error Codes
export const ERROR_CODES = {
  INVALID_INPUT: "INVALID_INPUT",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMIT: "RATE_LIMIT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  INVALID_TOKEN: "INVALID_TOKEN",
  EXPIRED_TOKEN: "EXPIRED_TOKEN",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_NOT_VERIFIED: "Please verify your email before signing in",
  USER_NOT_FOUND: "User not found",
  EMAIL_ALREADY_EXISTS: "Email already registered",
  EMAIL_NOT_FOUND: "No account found with this email",
  INVALID_OTP: "Invalid or expired OTP",
  INVALID_RESET_TOKEN: "Invalid or expired reset token",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",
  INVALID_INPUT: "Invalid input provided",
  UNAUTHORIZED_ACCESS: "Unauthorized access",
  NOT_FOUND: "Resource not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later",
  SESSION_EXPIRED: "Your session has expired. Please sign in again",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: "Registration successful. Please verify your email",
  VERIFICATION_SUCCESS: "Email verified successfully",
  LOGIN_SUCCESS: "Logged in successfully",
  LOGOUT_SUCCESS: "Logged out successfully",
  PASSWORD_RESET_SENT: "Password reset link sent to your email",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  TRIP_CREATED: "Trip created successfully",
  TRIP_GENERATED: "Itinerary generated successfully",
  TRIPS_RETRIEVED: "Trips retrieved successfully",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  PROFILE: "/app/profile",
  TRIPS: "/app/trips",
  NEW_TRIP: "/app/new-trip",
  ADMIN_DASHBOARD: "/admin",
  LANDING: "/",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH_REGISTER: "/api/auth/register",
  AUTH_LOGIN: "/api/auth/signin",
  AUTH_LOGOUT: "/api/auth/signout",
  AUTH_VERIFY_EMAIL: "/api/auth/verify-email",
  AUTH_FORGOT_PASSWORD: "/api/auth/forgot-password",
  AUTH_RESET_PASSWORD: "/api/auth/reset-password",
  PROFILE_GET: "/api/profile/get-profile",
  PROFILE_UPDATE: "/api/profile/update-profile",
  TRIP_GENERATE: "/api/trip/generate",
  TRIP_GET: "/api/trip/get-trips",
} as const;

// Gender Options
export const GENDER_OPTIONS = ["male", "female", "other", "prefer_not_to_say"] as const;

// Trip Pace Options
export const TRIP_PACE_OPTIONS = ["relaxed", "moderate", "fast"] as const;

// Transportation Options
export const TRANSPORTATION_OPTIONS = ["car", "buses", "flights", "mix"] as const;

// Accommodation Options
export const ACCOMMODATION_OPTIONS = [
  "luxury",
  "mid-range",
  "budget",
  "backpacker",
] as const;

// Trip Type Options
export const TRIP_TYPE_OPTIONS = [
  "adventure",
  "cultural",
  "relaxation",
  "family",
  "honeymoon",
  "solo",
  "trekking",
  "wildlife",
] as const;

// Interest Options
export const INTEREST_OPTIONS = [
  "hiking",
  "photography",
  "food",
  "history",
  "culture",
  "nature",
  "adventure",
  "relaxation",
  "shopping",
  "nightlife",
  "art",
  "music",
  "sports",
] as const;

// Dining Preference Options
export const DINING_OPTIONS = [
  "vegetarian",
  "vegan",
  "halal",
  "kosher",
  "no-restrictions",
] as const;

// Special Occasion Options
export const SPECIAL_OCCASION_OPTIONS = [
  "none",
  "birthday",
  "anniversary",
  "honeymoon",
  "family-reunion",
  "celebration",
] as const;

// Feature Flags
export const FEATURES = {
  TRIP_EDITING: false,
  TRIP_SHARING: false,
  TWO_FACTOR_AUTH: false,
  SOCIAL_LOGIN: true,
  EMAIL_NOTIFICATIONS: true,
} as const;

// External Services
export const SERVICES = {
  GOOGLE_GEMINI: "gemini-2.0-flash",
  NEXTAUTH_PROVIDERS: ["credentials", "google"],
} as const;
