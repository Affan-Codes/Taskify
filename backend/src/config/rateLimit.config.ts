import rateLimit from "express-rate-limit";
import { config } from "./app.config";
import { MongoRateLimitStore } from "../utils/mongoRateLimitStore";
import { HTTPSTATUS } from "./http.config";

/**
 * Standard rate limiter for general API endpoints
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  limit: 100,
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  store: new MongoRateLimitStore({
    windowMs: 15 * 60 * 1000,
    prefix: "general",
  }),
  message: {
    message: "Too many requests from this IP, please try again later",
    retryAfter: 15 * 60,
  },
  statusCode: HTTPSTATUS.TOO_MANY_REQUESTS,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    // Rate limit by IP + User Agent for better tracking
    return req.ip + (req.get("user-agent") || "");
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP+email
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new MongoRateLimitStore({
    windowMs: 15 * 60 * 1000,
    prefix: "auth:",
  }),
  message: {
    message: "Too many authentication attempts, please try again later",
    retryAfter: 15 * 60,
  },
  statusCode: HTTPSTATUS.TOO_MANY_REQUESTS,
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false, // Count failed attempts
  keyGenerator: (req) => {
    // Rate limit by IP + email being attempted
    const email = req.body?.email || "";
    return req.ip + email;
  },
});

/**
 * Moderate rate limiter for registration
 * 3 registrations per hour per IP
 * Prevents account spam
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: new MongoRateLimitStore({
    windowMs: 60 * 60 * 1000,
    prefix: "register:",
  }),
  message: {
    message: "Too many accounts created from this IP, please try again later",
    retryAfter: 60 * 60,
  },
  statusCode: HTTPSTATUS.TOO_MANY_REQUESTS,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => req.ip as string,
});

/**
 * Lenient rate limiter for OAuth callbacks
 * 10 requests per 15 minutes per IP
 */
export const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new MongoRateLimitStore({
    windowMs: 15 * 60 * 1000,
    prefix: "oauth:",
  }),
  message: {
    message: "Too many OAuth attempts, please try again later",
    retryAfter: 15 * 60,
  },
  statusCode: HTTPSTATUS.TOO_MANY_REQUESTS,
});

/**
 * Strict rate limiter for creating resources
 * 20 creates per hour per user
 * Prevents spam of workspaces/projects/tasks
 */
export const createResourceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: new MongoRateLimitStore({
    windowMs: 60 * 60 * 1000,
    prefix: "create:",
  }),
  message: {
    message: "Too many resources created, please try again later",
    retryAfter: 60 * 60,
  },
  statusCode: HTTPSTATUS.TOO_MANY_REQUESTS,
  keyGenerator: (req) => {
    // Rate limit by user ID for authenticated requests
    return req.user?._id?.toString() || req.ip;
  },
});
