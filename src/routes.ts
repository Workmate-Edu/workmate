/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  "/",
  "/privacy",
  "/terms",
  "/about",
  "/courses",
  "/arabic-center",
  "/contact",
  "/subjects",
  "/assessment",
  "/safety",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /dashboard
 * @type {string[]}
 */
export const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/auth/error",
  "/auth/verify",
  "/auth/verify-request",
  "/auth/reset",
  "/auth/reset-password",
];

/**
 * An array of routes that are private and require authentication
 * These routes will redirect unauthenticated users to /sign-in
 * @type {string[]}
 */
export const privateRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/messages",
  "/notifications",
  "/assignments",
  "/schedule",
  "/classes",
  "/progress",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The prefix for API admin routes
 * Routes that start with this prefix are used for API admin purposes
 * @type {string}
 */
export const apiAdminPrefix = "/api/admin";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
