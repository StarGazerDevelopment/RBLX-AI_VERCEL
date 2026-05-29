const Groq = require("groq-sdk");
const {
  buildMemoryNote,
  buildUserPrompt,
  cleanOneLine,
  coerceFinalResponse,
  getDeterministicResponse,
  getMonthStamp,
  getUsageLimit,
  getUserKey,
  normalizeMessage,
} = require("../lib/noobai");
const { ensureMethod, getField, sendJson } = require("../lib/request");
const {
  isRedisConfigured,
  safeExpire,
  safeGet,
  safeIncrBy,
  safeSet,
} = require("../lib/redis");
const { getSystemPrompt } = require("../lib/systemPrompt");

let groqClient = null;

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY");
  }

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqClient;
}

function normalizePersonality(value) {
  const candidate = cleanOneLine(value || "friendly").toLowerCase();
  const allowed = new Set(["friendly", "grumpy", "hyper", "calm", "shy", "guard"]);
  return allowed.has(candidate) ? candidate : "friendly";
}

async function getUsageSnapshot(userKey) {
  if (!isRedisConfigured() || !userKey) {
    return {
      tracked: false,
      premium: false,
      used: 0,
      limit: getUsageLimit(false),
      remaining: getUsageLimit(false),
    };
  }

  const premiumKey = `noobai:premium:${userKey}`;
  const monthKey = `noobai:chat:used:${userKey}:${getMonthStamp()}`;
  const isPremium = Boolean(await safeGet(premiumKey));
  const used = parseInt((await safeGet(monthKey)) || "0", 10);
  const limit = getUsageLimit(isPremium);

  return {
    tracked: true,
    premium: isPremium,
    used,
    limit,
    remaining: Math.max(limit - used, 0),
  };
}

module.exports = async (req, res) => {
  if (!ensureMethod(req, res, ["GET", "POST"])) {
    return;
  }

  try {
    const message = cleanOneLine(getField(req, ["msg", "message"], ""));
    const playerName = cleanOneLine(getField(req, ["player", "playerName"], "Unknown"));
    const userId = cleanOneLine(getField(req, ["userId", "userid"], playerName));
    const personality = normalizePersonality(
      getField(req, ["personality", "mode"], "friendly")
    );

    if (!message) {
      return sendJson(res, 400, { error: "Missing msg or message field", response: null });
    }

    const userKey = getUserKey(userId, playerName);
    const normalizedMessage = normalizeMessage(message);
    const memoryKey = `noobai:chat:memory:${userKey}`;
    const cacheKey = `noobai:bot:${normalizedMessage}`;
    let memoryNote = "none";

    if (isRedisConfigured()) {
      memoryNote = (await safeGet(memoryKey)) || "none";

      const cached = normalizedMessage ? await safeGet(cacheKey) : null;
      if (cached) {
        const usage = await getUsageSnapshot(userKey);
        return sendJson(res, 200, {
          response: cached,
          cached: true,
          source: "redis-cache",
          usage,
        });
      }
    }

    const usageBefore = await getUsageSnapshot(userKey);
    if (usageBefore.tracked && usageBefore.used >= usageBefore.limit) {
      return sendJson(res, 429, {
        response: null,
        error: "Monthly limit reached",
        usage: usageBefore,
      });
    }

    const context = {
      message,
      playerName,
      personality,
      memoryNote,
    };

    const deterministic = getDeterministicResponse(context);
    let rawResponse = deterministic;
    let source = deterministic ? "deterministic" : "groq";

    if (!rawResponse) {
      const completion = await getGroqClient().chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content: getSystemPrompt(),
          },
          {
            role: "user",
            content: buildUserPrompt({
              playerName,
              personality,
              memoryNote,
              message,
            }),
          },
        ],
      });

      rawResponse = completion.choices[0].message.content;
    }

    const finalResponse = coerceFinalResponse(rawResponse, context);
    const usageDelta = message.length + finalResponse.cleanResponse.length;

    if (isRedisConfigured()) {
      if (finalResponse.cacheable && normalizedMessage) {
        await safeSet(cacheKey, finalResponse.cleanResponse, {
          ex: 60 * 60 * 24 * 7,
        });
      }

      const monthKey = `noobai:chat:used:${userKey}:${getMonthStamp()}`;
      await safeIncrBy(monthKey, usageDelta);
      await safeExpire(monthKey, 60 * 60 * 24 * 32);
      await safeSet(memoryKey, buildMemoryNote(message), {
        ex: 60 * 60 * 24 * 30,
      });
    }

    const usage = await getUsageSnapshot(userKey);

    console.log(
      JSON.stringify({
        playerName,
        userKey,
        personality,
        message,
        source,
        repaired: Boolean(finalResponse.repaired),
        response: finalResponse.cleanResponse,
      })
    );

    return sendJson(res, 200, {
      response: finalResponse.cleanResponse,
      cached: false,
      source,
      repaired: Boolean(finalResponse.repaired),
      usage,
    });
  } catch (error) {
    console.error("NoobAI /api/ai error:", error);
    return sendJson(res, 500, {
      response: null,
      error: "Internal server error",
      details: error.message,
    });
  }
};

