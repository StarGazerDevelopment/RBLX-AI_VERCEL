const { cleanOneLine, getUserKey } = require("../../lib/noobai");
const { ensureMethod, getField, sendJson } = require("../../lib/request");
const { isRedisConfigured, safeDel, safeGet, safeSet } = require("../../lib/redis");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  try {
    if (!isRedisConfigured()) {
      return sendJson(res, 500, {
        error: "Redis is required for link joins",
      });
    }

    const userId = cleanOneLine(getField(req, ["userId", "userid"], ""));
    const playerName = cleanOneLine(
      getField(req, ["playerName", "player"], "Unknown")
    );
    const code = cleanOneLine(getField(req, ["code"], "")).toUpperCase();

    if (!userId || !code) {
      return sendJson(res, 400, {
        error: "Missing userId or code",
      });
    }

    const userKey = getUserKey(userId, playerName);
    const rawLinkData = await safeGet(`noobai:link:${code}`);

    if (!rawLinkData) {
      return sendJson(res, 404, {
        error: "Link code not found or expired",
      });
    }

    const linkData =
      typeof rawLinkData === "string" ? JSON.parse(rawLinkData) : rawLinkData;

    if (!linkData.userId || linkData.userId === userKey) {
      return sendJson(res, 400, {
        error: "Cannot join your own link code",
      });
    }

    await safeSet(`noobai:linked:${linkData.userId}`, userKey, {
      ex: 60 * 60 * 2,
    });
    await safeSet(`noobai:linked:${userKey}`, linkData.userId, {
      ex: 60 * 60 * 2,
    });
    await safeDel(`noobai:link:${code}`);

    return sendJson(res, 200, {
      ok: true,
      linked: true,
      partnerUserId: linkData.userId,
      partnerPlayerName: linkData.playerName || "Unknown",
      expiresInSeconds: 60 * 60 * 2,
    });
  } catch (error) {
    console.error("NoobAI /api/link/join error:", error);
    return sendJson(res, 500, {
      error: "Internal server error",
      details: error.message,
    });
  }
};
