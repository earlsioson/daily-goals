// src/utils/rateLimit.ts
type SessionData = {
  count: number;
  resetAt: number;
  lastRequestTime: number;
};

// Simple in-memory store for rate limiting
// Note: This is reset whenever the server restarts
// For production, consider using a persistent store like Redis
const sessionLimits = new Map<string, SessionData>();

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  throttled?: boolean;
  waitTime?: number; // in seconds
  userMessage: string;
};

export function checkRateLimit(
  sessionId: string,
  options: {
    maxRequestsPerHour?: number;
    minTimeBetweenRequests?: number; // in ms
  } = {}
): RateLimitResult {
  const {
    maxRequestsPerHour = 100, // Default max requests per hour
    minTimeBetweenRequests = 10000, // Default 10 seconds between requests
  } = options;
  
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  
  // Clean up expired entries
  for (const [id, data] of sessionLimits.entries()) {
    if (data.resetAt < now) {
      sessionLimits.delete(id);
    }
  }
  
  // Get or create session data
  let sessionData = sessionLimits.get(sessionId);
  if (!sessionData || sessionData.resetAt < now) {
    sessionData = {
      count: 0,
      resetAt: now + hourInMs,
      lastRequestTime: 0,
    };
  }
  
  // Check for rapid fire requests
  const timeSinceLastRequest = now - sessionData.lastRequestTime;
  if (timeSinceLastRequest < minTimeBetweenRequests) {
    const waitTime = Math.ceil((minTimeBetweenRequests - timeSinceLastRequest) / 1000);
    return {
      success: false,
      limit: maxRequestsPerHour,
      remaining: Math.max(0, maxRequestsPerHour - sessionData.count),
      reset: new Date(sessionData.resetAt),
      throttled: true,
      waitTime,
      userMessage: `Please wait ${waitTime} seconds before making another request. This helps ensure optimal AI performance.`
    };
  }
  
  // Increment count and update lastRequestTime
  sessionData.count += 1;
  sessionData.lastRequestTime = now;
  sessionLimits.set(sessionId, sessionData);
  
  // Check if rate limit is exceeded
  const remaining = Math.max(0, maxRequestsPerHour - sessionData.count);
  const success = sessionData.count <= maxRequestsPerHour;
  
  // Prepare reset time
  const reset = new Date(sessionData.resetAt);
  
  // Generate a user-friendly message based on remaining requests
  let userMessage = 'Your request has been processed successfully.';
  
  if (!success) {
    const resetTimeString = reset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    userMessage = `You've reached the limit of ${maxRequestsPerHour} requests per hour. Your limit will reset at ${resetTimeString}. This helps us provide reliable service to all users.`;
  } else if (remaining <= 3) {
    userMessage = `You have ${remaining} requests remaining in this hour. Please use them wisely!`;
  } else if (remaining <= 10) {
    userMessage = `You have ${remaining} requests remaining in this hour.`;
  }
  
  return {
    success,
    limit: maxRequestsPerHour,
    remaining,
    reset,
    userMessage
  };
}
