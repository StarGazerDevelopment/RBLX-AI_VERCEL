const { ensureMethod, sendJson } = require("../lib/request");
const { isRedisConfigured } = require("../lib/redis");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["GET"])) {
    return;
  }

  return sendJson(res, 200, {
    status: "healthy",
    service: "noobai-vercel-backend",
    runtime: "vercel-node",
    providers: {
      groqConfigured: Boolean(process.env.GROQ_API_KEY),
      redisConfigured: isRedisConfigured(),
    },
  });
};
