const { cleanOneLine, getUserKey } = require("../../lib/noobai");
const { ensureMethod, getField, sendJson } = require("../../lib/request");
const { isRedisConfigured, safeDel, safeGet } = require("../../lib/redis");

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  try {
    if (!isRedisConfigured()) {
      return sendJson(res, 500, {
        error: "Redis is required for unlink",
      });
    }

    const userId = cleanOneLine(getField(req, ["userId", "userid"], ""));
    const playerName = cleanOneLine(getField(req, ["playerName", "player"], ""));

    if (!userId && !playerName) {
      return sendJson(res, 400, {
        error: "Missing userId or player field",
      });
    }

    const userKey = getUserKey(userId, playerName);
    const partnerUserId = await safeGet(`noobai:linked:${userKey}`);

    if (!partnerUserId) {
      return sendJson(res, 200, {
        ok: true,
        linked: false,
      });
    }

    await safeDel(`noobai:linked:${userKey}`, `noobai:linked:${partnerUserId}`);

    return sendJson(res, 200, {
      ok: true,
      linked: false,
      removedPartner: partnerUserId,
    });
  } catch (error) {
    console.error("NoobAI /api/link/unlink error:", error);
    return sendJson(res, 500, {
      error: "Internal server error",
      details: error.message,
    });
  }
};
