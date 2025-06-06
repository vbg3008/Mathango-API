import { redisClient } from "../utils/redisConfig.js";

const rateLimiter = async (req, res, next) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const key = `rate_limit:${clientIP}`;
    const current = await redisClient.get(key);
    if (current === null) {
      await redisClient.setEx(key, 60, "1");
      return next();
    }
    const requestCount = parseInt(current);
    if (requestCount >= 30) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Rate limit exceeded. Only 30 requests per minute allowed."
      });
    }
    await redisClient.incr(key);
    next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    next();
  }
};

export default rateLimiter;