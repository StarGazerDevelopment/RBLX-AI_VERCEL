const { cleanOneLine, getUserKey } = require("../../lib/noobai");
const { ensureMethod, getField, sendJson } = require("../../lib/request");
const { isRedisConfigured, safeSet } = require("../../lib/redis");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  try {
    if (!isRedisConfigured()) {
      return sendJson(res, 500, {
        error: "Redis is required for premium grants",
      });
    }

    const userId = cleanOneLine(getField(req, ["userId", "userid"], ""));
    const playerName = cleanOneLine(getField(req, ["player", "playerName"], ""));

    if (!userId && !playerName) {
      return sendJson(res, 400, {
        error: "Missing userId or player field",
      });
    }

    const userKey = getUserKey(userId, playerName);
    await safeSet(`noobai:premium:${userKey}`, "1", {
      ex: 60 * 60 * 24 * 365,
    });

    return sendJson(res, 200, {
      ok: true,
      userKey,
      premium: true,
      expiresInSeconds: 60 * 60 * 24 * 365,
    });
  } catch (error) {
    console.error("NoobAI /api/premium/grant error:", error);
    return sendJson(res, 500, {
      error: "Internal server error",
      details: error.message,
    });
  }
};
