const { buildLinkCode, cleanOneLine, getUserKey } = require("../../lib/noobai");
const { ensureMethod, getField, sendJson } = require("../../lib/request");
const { isRedisConfigured, safeSet } = require("../../lib/redis");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  try {
    if (!isRedisConfigured()) {
      return sendJson(res, 500, {
        error: "Redis is required for link generation",
      });
    }

    const userId = cleanOneLine(getField(req, ["userId", "userid"], ""));
    const playerName = cleanOneLine(
      getField(req, ["playerName", "player"], "Unknown")
    );

    if (!userId) {
      return sendJson(res, 400, {
        error: "Missing userId",
      });
    }

    const userKey = getUserKey(userId, playerName);
    const code = buildLinkCode();

    await safeSet(
      `noobai:link:${code}`,
      JSON.stringify({
        userId: userKey,
        playerName,
      }),
      {
        ex: 60 * 5,
      }
    );

    return sendJson(res, 200, {
      ok: true,
      code,
      expiresInSeconds: 60 * 5,
    });
  } catch (error) {
    console.error("NoobAI /api/link/generate error:", error);
    return sendJson(res, 500, {
      error: "Internal server error",
      details: error.message,
    });
  }
};
