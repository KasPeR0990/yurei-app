// utils/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimit instance that allows 3 requests per month
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  // Using fixed window since it's a long period (30 days)
  limiter: Ratelimit.fixedWindow(3, "30 d"),
  analytics: true,
  prefix: "yurei-beta_rate_limit",
});

