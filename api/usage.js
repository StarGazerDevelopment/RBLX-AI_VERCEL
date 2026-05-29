const { getMonthStamp, getUsageLimit, getUserKey } = require("../lib/noobai");
const { ensureMethod, getField, sendJson } = require("../lib/request");
const { isRedisConfigured, safeGet } = require("../lib/redis");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["GET", "POST"])) {
    return;
  }

  try {
    const userId = getField(req, ["userId", "userid"], "");
    const playerName = getField(req, ["player", "playerName"], "");

    if (!userId && !playerName) {
      return sendJson(res, 400, {
        error: "Missing userId or player field",
      });
    }

    const userKey = getUserKey(userId, playerName);

    if (!isRedisConfigured()) {
      return sendJson(res, 200, {
        tracked: false,
        premium: false,
        used: 0,
        limit: getUsageLimit(false),
        remaining: getUsageLimit(false),
      });
    }

    const premiumKey = `noobai:premium:${userKey}`;
    const monthKey = `noobai:chat:used:${userKey}:${getMonthStamp()}`;
    const premium = Boolean(await safeGet(premiumKey));
    const used = parseInt((await safeGet(monthKey)) || "0", 10);
    const limit = getUsageLimit(premium);

    return sendJson(res, 200, {
      tracked: true,
      premium,
      used,
      limit,
      remaining: Math.max(limit - used, 0),
    });
  } catch (error) {
    console.error("NoobAI /api/usage error:", error);
    return sendJson(res, 500, {
      error: "Internal server error",
      details: error.message,
    });
  }
};
