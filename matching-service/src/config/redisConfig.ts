import { createClient } from "redis";

const redis_url = process.env.REDIS_URL || "redis://redis-server:6379";

// Create Redis client
const redisClient = createClient({
  url: redis_url,
});

redisClient.on("connect", () => {
  console.log("Connected to Redis on:", redis_url);
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

export default redisClient;
