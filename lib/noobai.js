const crypto = require("crypto");

const STATIC_COMMANDS = [
  "ok, jumping now!",
  "ok, sprinting!",
  "ok, turbo speed!",
  "ok, slow motion!",
  "ok, normal speed!",
  "ok, stopping movement!",
  "ok, teleporting to you!",
  "ok, returning to spawn!",
  "ok, facing you!",
  "ok, backflipping now!",
  "ok, moonwalking!",
  "ok, navigating to you!",
  "okay, following you now!",
  "okay i won't follow you anymore!",
  "ok, fleeing from you!",
  "ok, chasing you!",
  "ok, patrolling now!",
  "ok, wandering now!",
  "ok, stopping patrol!",
  "ok, guarding now!",
  "ok, crouching now!",
  "ok, standing up now!",
  "ok, sleeping now!",
  "ok, waking up now!",
  "ok, playing dead!",
  "ok, reviving now!",
  "ok, freezing now!",
  "ok, unfreezing now!",
  "ok, sitting down!",
  "ok, getting up!",
  "ok, waving now!",
  "ok, dancing now!",
  "ok, celebrating now!",
  "ok, laughing now!",
  "ok, laughing out loud!",
  "ok, crying now!",
  "ok, clapping now!",
  "ok, shrugging now!",
  "ok, surprised now!",
  "ok, saluting now!",
  "ok, bowing now!",
  "ok, thumbs up!",
  "ok, thumbs down!",
  "ok, flexing now!",
  "ok, facepalming now!",
  "ok, peace sign!",
  "ok, thinking now!",
  "ok, pointing at you!",
  "ok, roaring now!",
  "ok, headbanging now!",
  "ok, blowing a kiss!",
  "ok, taunting now!",
  "ok, stretching now!",
  "ok, tiptoeing now!",
  "ok, scared now!",
  "ok, angry now!",
  "ok, excited now!",
  "ok, confused now!",
  "ok, sad now!",
  "ok, happy now!",
  "ok, nervous now!",
  "ok, disgusted now!",
  "ok, lovesick now!",
  "ok, proud now!",
  "ok, shocked now!",
  "ok, jealous now!",
  "ok, sparkling now!",
  "ok, on fire now!",
  "ok, smoking now!",
  "ok, glowing now!",
  "ok, removing effects!",
  "ok, invisible now!",
  "ok, visible now!",
  "ok, rainbow mode!",
  "ok, stopping rainbow!",
  "ok, disco mode!",
  "ok, flashing now!",
  "ok, shimmering now!",
  "ok, aura on!",
  "ok, aura off!",
  "ok, turning red now!",
  "ok, turning blue now!",
  "ok, turning green now!",
  "ok, turning yellow now!",
  "ok, turning purple now!",
  "ok, turning orange now!",
  "ok, turning pink now!",
  "ok, turning white now!",
  "ok, turning black now!",
  "ok, turning cyan now!",
  "ok, turning gold now!",
  "ok, turning silver now!",
  "ok, growing big now!",
  "ok, shrinking small now!",
  "ok, normal size now!",
  "ok, giant now!",
  "ok, tiny now!",
  "ok, screaming now!",
  "ok, cheering now!",
  "ok, silent now!",
  "ok, healing now!",
  "ok, hurt reaction!",
  "ok, low health mode!",
  "ok, switching to friendly mode!",
  "ok, switching to grumpy mode!",
  "ok, switching to hyper mode!",
  "ok, switching to calm mode!",
  "ok, switching to shy mode!",
  "ok, switching to guard mode!",
  "ok, rewarding you!",
  "ok, fining you!",
  "ok, it's morning!",
  "ok, it's noon!",
  "ok, it's sunset!",
  "ok, it's night!",
  "ok, making it foggy!",
  "ok, clearing the fog!",
  "ok, clearing status!",
  "ok, scanning now!",
  "ok, self destructing!",
];

const DYNAMIC_COMMAND_PATTERNS = [
  /^(.+?)\s(ok, jumping [2-5] times!)$/,
  /^(.+?)\s(ok, walking (forward|backward|left|right) ([5-9]|[1-3][0-9]|40) studs!)$/,
  /^(.+?)\s(ok, running (forward|backward|left|right) ([5-9]|[1-3][0-9]|40) studs!)$/,
  /^(.+?)\s(ok, facing (north|south|east|west)!)$/,
  /^(.+?)\s(ok, spinning [1-5] times!)$/,
  /^(.+?)\s(ok, giving you (1|5|10|25) coins!)$/,
  /^(.+?)\s(ok, taking (1|2|5) coins!)$/,
  /^(.+?)\s(ok, setting time to ([0-9]|1[0-9]|2[0-3])!)$/,
  /^(.+?)\s(ok, status: [A-Za-z0-9 ]{1,20}!)$/,
];

const NUMBER_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  twentyone: 21,
  twentytwo: 22,
  twentythree: 23,
};

const PERSONALITY_TEXT = {
  friendly: {
    ack: "Sure thing!! 😊",
    memory: "Oh, you're back!",
    denyAi: "AI? Rude. I'm a Roblox creature.",
    denyCoins: "Nope. Earn them first.",
    fallback: "Hehe... let me think!",
  },
  grumpy: {
    ack: "Fine.",
    memory: "You're back. Great.",
    denyAi: "What? No. Obviously not.",
    denyCoins: "No. Earn them.",
    fallback: "Ugh. Thinking.",
  },
  hyper: {
    ack: "YES!! RIGHT NOW!!",
    memory: "YOU'RE BACK!!!",
    denyAi: "AI?! NO!! I LIVE HERE!!",
    denyCoins: "NO FREE COINS!! EARN THEM!!",
    fallback: "WAIT WAIT I HAVE AN IDEA!!",
  },
  calm: {
    ack: "Of course...",
    memory: "You returned... I remember...",
    denyAi: "No... I am a creature of Roblox...",
    denyCoins: "Coins must be earned...",
    fallback: "Let me consider this...",
  },
  shy: {
    ack: "O-okay...",
    memory: "Oh... you're back...",
    denyAi: "N-no... NoobAI is real...",
    denyCoins: "Um... you should earn them...",
    fallback: "Um... let me think...",
  },
  guard: {
    ack: "Affirmative.",
    memory: "Recognized. Welcome back.",
    denyAi: "Negative. I am field personnel.",
    denyCoins: "Negative. Coins are earned.",
    fallback: "Processing request.",
  },
};

const EMOTE_MATCHERS = [
  { pattern: /\bwave\b/, command: "ok, waving now!" },
  { pattern: /\bdance\b/, command: "ok, dancing now!" },
  { pattern: /\bcelebrat(e|ion)\b/, command: "ok, celebrating now!" },
  { pattern: /\blaugh\b/, command: "ok, laughing out loud!" },
  { pattern: /\bcry\b/, command: "ok, crying now!" },
  { pattern: /\bclap\b/, command: "ok, clapping now!" },
  { pattern: /\bshrug\b/, command: "ok, shrugging now!" },
  { pattern: /\bsalute\b/, command: "ok, saluting now!" },
  { pattern: /\bbow\b/, command: "ok, bowing now!" },
  { pattern: /\bthumbs up\b/, command: "ok, thumbs up!" },
  { pattern: /\bthumbs down\b/, command: "ok, thumbs down!" },
  { pattern: /\bflex\b/, command: "ok, flexing now!" },
  { pattern: /\bfacepalm\b/, command: "ok, facepalming now!" },
  { pattern: /\bpeace\b/, command: "ok, peace sign!" },
  { pattern: /\bthink\b/, command: "ok, thinking now!" },
  { pattern: /\bpoint at me\b/, command: "ok, pointing at you!", personal: true },
  { pattern: /\broar\b/, command: "ok, roaring now!" },
  { pattern: /\bheadbang\b/, command: "ok, headbanging now!" },
  { pattern: /\bblow (me )?a kiss\b/, command: "ok, blowing a kiss!", personal: true },
  { pattern: /\btaunt\b/, command: "ok, taunting now!" },
  { pattern: /\bstretch\b/, command: "ok, stretching now!" },
  { pattern: /\btiptoe\b/, command: "ok, tiptoeing now!" },
];

const COLOR_COMMANDS = {
  red: "ok, turning red now!",
  blue: "ok, turning blue now!",
  green: "ok, turning green now!",
  yellow: "ok, turning yellow now!",
  purple: "ok, turning purple now!",
  orange: "ok, turning orange now!",
  pink: "ok, turning pink now!",
  white: "ok, turning white now!",
  black: "ok, turning black now!",
  cyan: "ok, turning cyan now!",
  gold: "ok, turning gold now!",
  silver: "ok, turning silver now!",
};

function cleanOneLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeMessage(message) {
  return cleanOneLine(message)
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getUserKey(userId, playerName) {
  const candidate =
    cleanOneLine(userId) || cleanOneLine(playerName).toLowerCase().replace(/\s+/g, "_");
  return candidate || "anonymous";
}

function getMonthStamp(now = new Date()) {
  return now.toISOString().slice(0, 7);
}

function getUsageLimit(isPremium) {
  return isPremium ? 500000 : 50000;
}

function buildUserPrompt({ playerName, personality, memoryNote, message }) {
  return `Player: ${playerName}\nPersonality: ${personality}\nMemory: ${memoryNote}\nMessage: "${message}"`;
}

function getPersonalityText(personality) {
  return PERSONALITY_TEXT[personality] || PERSONALITY_TEXT.friendly;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (Number.isFinite(number) && number >= min && number <= max) {
    return Math.trunc(number);
  }

  return fallback;
}

function parseWordNumber(input) {
  const compact = input.replace(/[\s-]/g, "");
  return NUMBER_WORDS[compact];
}

function parseCount(message, min, max, fallback) {
  const digitMatch = message.match(/\b(\d+)\b/);
  if (digitMatch) {
    return clampNumber(digitMatch[1], min, max, fallback);
  }

  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    if (message.includes(word)) {
      return clampNumber(value, min, max, fallback);
    }
  }

  return fallback;
}

function buildResponse(text, command, options = {}) {
  const reply = cleanOneLine(text).slice(0, 120);
  const cacheable = Boolean(options.cacheable && !options.personal && !options.hasMemory);
  return `${reply} ${command}${cacheable ? " --common" : ""}`;
}

function applyMemoryPrefix(text, personality, hasMemory) {
  if (!hasMemory) {
    return text;
  }

  return `${getPersonalityText(personality).memory} ${text}`;
}

function getFallbackResponse(personality, hasMemory) {
  const text = applyMemoryPrefix(
    getPersonalityText(personality).fallback,
    personality,
    hasMemory
  );

  return buildResponse(text, "ok, thinking now!", {
    cacheable: !hasMemory,
    hasMemory,
  });
}

function getExactCommandMatch(response) {
  for (const command of STATIC_COMMANDS) {
    if (response.endsWith(command)) {
      const prefix = response.slice(0, -command.length).trimEnd();
      if (prefix.length > 0) {
        return { reply: prefix, command };
      }
    }
  }

  for (const pattern of DYNAMIC_COMMAND_PATTERNS) {
    const match = response.match(pattern);
    if (match) {
      return { reply: match[1], command: match[2] };
    }
  }

  return null;
}

function parseModelResponse(rawResponse) {
  const oneLine = cleanOneLine(rawResponse);
  if (!oneLine) {
    return { valid: false, reason: "Empty response" };
  }

  const luaMatch = oneLine.match(/^(.*?)\s+--luacode\s+"([\s\S]+)"$/);
  if (luaMatch) {
    const reply = cleanOneLine(luaMatch[1]);
    if (!reply || reply.length > 120) {
      return { valid: false, reason: "Invalid luacode reply text" };
    }

    return {
      valid: true,
      cleanResponse: `${reply} --luacode "${luaMatch[2]}"`,
      cacheable: false,
      type: "luacode",
    };
  }

  const isCommon = /--common\s*$/.test(oneLine);
  const withoutCommon = oneLine.replace(/\s*--common\s*$/, "");
  const match = getExactCommandMatch(withoutCommon);

  if (!match) {
    return { valid: false, reason: "No valid command suffix found" };
  }

  if (match.reply.length > 120) {
    return { valid: false, reason: "Reply text exceeded 120 characters" };
  }

  return {
    valid: true,
    cleanResponse: `${match.reply} ${match.command}`,
    cacheable: isCommon,
    type: "command",
  };
}

function getDeterministicResponse({ message, personality, memoryNote }) {
  const lower = cleanOneLine(message).toLowerCase();
  const hasMemory = Boolean(memoryNote && memoryNote !== "none");
  const tone = getPersonalityText(personality);

  function compose(text, command, options = {}) {
    return buildResponse(applyMemoryPrefix(text, personality, hasMemory), command, {
      cacheable: options.cacheable,
      personal: options.personal,
      hasMemory,
    });
  }

  if (!lower) {
    return null;
  }

  if (/\b(ai|bot|llm|language model|claude)\b/.test(lower)) {
    return compose(tone.denyAi, "ok, facepalming now!", { personal: true });
  }

  if ((/\b(stop|dont|don't|won't)\b/.test(lower) && /\bfollow/.test(lower)) || /\bstop following\b/.test(lower)) {
    return compose("Stopping there.", "okay i won't follow you anymore!", {
      personal: true,
    });
  }

  if (/\bfollow me\b|\bcome with me\b/.test(lower)) {
    return compose(tone.ack, "okay, following you now!", { personal: true });
  }

  if (/\bchase me\b|\bcatch me\b/.test(lower)) {
    return compose("You asked for pursuit.", "ok, chasing you!", {
      personal: true,
    });
  }

  if (/\brun away\b|\bflee\b|\byou scare me\b|\bgo away scary\b/.test(lower)) {
    return compose("Backing off now.", "ok, fleeing from you!", {
      personal: true,
    });
  }

  const jumpTimesMatch = lower.match(/\bjump\s+(\d+)\s+times?\b/);
  if (jumpTimesMatch) {
    const count = clampNumber(jumpTimesMatch[1], 2, 5, 3);
    return compose(tone.ack, `ok, jumping ${count} times!`, { cacheable: true });
  }

  const wordJumpMatch = lower.match(/\bjump\s+([a-z-]+)\s+times?\b/);
  if (wordJumpMatch) {
    const count = clampNumber(parseWordNumber(wordJumpMatch[1]), 2, 5, 3);
    return compose(tone.ack, `ok, jumping ${count} times!`, { cacheable: true });
  }

  if (/\bjump\b/.test(lower)) {
    const jumpWords = lower.match(/\bjump\b/g);
    if (jumpWords && jumpWords.length >= 2) {
      const count = clampNumber(jumpWords.length, 2, 5, 3);
      return compose(tone.ack, `ok, jumping ${count} times!`, { cacheable: true });
    }

    return compose(tone.ack, "ok, jumping now!", { cacheable: true });
  }

  const walkMatch = lower.match(/\b(walk|go|move)\s+(forward|backward|left|right)(?:\s+(\d+)\s+studs?)?\b/);
  if (walkMatch) {
    const studs = clampNumber(walkMatch[3], 5, 40, 10);
    return compose(tone.ack, `ok, walking ${walkMatch[2]} ${studs} studs!`, {
      cacheable: true,
    });
  }

  const runMatch = lower.match(/\b(run)\s+(forward|backward|left|right)(?:\s+(\d+)\s+studs?)?\b/);
  if (runMatch) {
    const studs = clampNumber(runMatch[3], 5, 40, 15);
    return compose(tone.ack, `ok, running ${runMatch[2]} ${studs} studs!`, {
      cacheable: true,
    });
  }

  if (/\b(go as fast as possible|turbo)\b/.test(lower)) {
    return compose("Turbo engaged.", "ok, turbo speed!", { cacheable: true });
  }

  if (/\b(sprint|hurry|go fast)\b/.test(lower)) {
    return compose(tone.ack, "ok, sprinting!", { cacheable: true });
  }

  if (/\bslow\b/.test(lower)) {
    return compose("Slowing down.", "ok, slow motion!", { cacheable: true });
  }

  if (/\bnormal speed\b|\brestore speed\b/.test(lower)) {
    return compose("Back to normal.", "ok, normal speed!", { cacheable: true });
  }

  if (/\b(stop|freeze in place|dont move|don't move)\b/.test(lower)) {
    return compose("Stopping.", "ok, stopping movement!", { cacheable: true });
  }

  if (/\bcome here right now\b/.test(lower)) {
    return compose("I'm right there.", "ok, teleporting to you!", {
      personal: true,
    });
  }

  if (/\b(come to me|find me|walk to me)\b/.test(lower)) {
    return compose("Navigating over.", "ok, navigating to you!", {
      personal: true,
    });
  }

  if (/\b(go home|go back|return to spawn)\b/.test(lower)) {
    return compose("Heading home.", "ok, returning to spawn!", {
      cacheable: true,
    });
  }

  if (/\b(look at me|face me)\b/.test(lower)) {
    return compose("I see you.", "ok, facing you!", { personal: true });
  }

  const faceDirectionMatch = lower.match(/\bface\s+(north|south|east|west)\b/);
  if (faceDirectionMatch) {
    return compose("Turning now.", `ok, facing ${faceDirectionMatch[1]}!`, {
      cacheable: true,
    });
  }

  if (/\bspin\b/.test(lower)) {
    const count = parseCount(lower, 1, 5, 1);
    return compose("Spinning up.", `ok, spinning ${count} times!`, {
      cacheable: true,
    });
  }

  if (/\bbackflip\b/.test(lower)) {
    return compose("Here goes.", "ok, backflipping now!", { cacheable: true });
  }

  if (/\bmoonwalk\b/.test(lower)) {
    return compose("Stylish.", "ok, moonwalking!", { cacheable: true });
  }

  if (/\bpatrol\b/.test(lower) && !/\bstop patrol/.test(lower)) {
    return compose("On patrol.", "ok, patrolling now!", { cacheable: true });
  }

  if (/\bwander\b|\bexplore\b|\broam\b/.test(lower)) {
    return compose("Roaming now.", "ok, wandering now!", { cacheable: true });
  }

  if (/\bstop patrol\b|\bstop patrolling\b/.test(lower)) {
    return compose("Standing down.", "ok, stopping patrol!", { cacheable: true });
  }

  if (/\bguard\b|\bstand watch\b|\bprotect this spot\b/.test(lower)) {
    return compose("Holding this position.", "ok, guarding now!", {
      cacheable: true,
    });
  }

  if (/\bcrouch\b|\bduck\b|\bget low\b/.test(lower)) {
    return compose("Getting low.", "ok, crouching now!", { cacheable: true });
  }

  if (/\bstand up\b/.test(lower)) {
    return compose("Standing.", "ok, standing up now!", { cacheable: true });
  }

  if (/\bsleep\b|\btake a nap\b|\brest\b/.test(lower)) {
    return compose("Powering down.", "ok, sleeping now!", { cacheable: true });
  }

  if (/\bwake up\b|\balarm\b|\brise\b/.test(lower)) {
    return compose("I'm awake.", "ok, waking up now!", { cacheable: true });
  }

  if (/\bplay dead\b/.test(lower)) {
    return compose("Dramatic collapse.", "ok, playing dead!", {
      cacheable: true,
    });
  }

  if (/\brevive\b|\bget back up\b/.test(lower)) {
    return compose("Back again.", "ok, reviving now!", { cacheable: true });
  }

  if (/\bfreeze\b/.test(lower) && !/\bunfreeze\b/.test(lower)) {
    return compose("Frozen solid.", "ok, freezing now!", { cacheable: true });
  }

  if (/\bunfreeze\b|\bthaw\b/.test(lower)) {
    return compose("Thawing out.", "ok, unfreezing now!", { cacheable: true });
  }

  if (/\bsit\b|\btake a seat\b/.test(lower)) {
    return compose("Sitting down.", "ok, sitting down!", { cacheable: true });
  }

  if (/\bget up\b|\bstand\b/.test(lower)) {
    return compose("Getting up.", "ok, getting up!", { cacheable: true });
  }

  for (const matcher of EMOTE_MATCHERS) {
    if (matcher.pattern.test(lower)) {
      return compose(tone.ack, matcher.command, {
        cacheable: !matcher.personal,
        personal: matcher.personal,
      });
    }
  }

  if (/\bscared\b/.test(lower)) {
    return compose("That startled me.", "ok, scared now!", { cacheable: true });
  }

  if (/\bangry\b|\bmad\b/.test(lower)) {
    return compose("That did it.", "ok, angry now!", { cacheable: true });
  }

  if (/\bexcited\b/.test(lower)) {
    return compose("I can feel it.", "ok, excited now!", { cacheable: true });
  }

  if (/\bconfused\b|\bwhat\b.*\bhuh\b/.test(lower)) {
    return compose("I need a second.", "ok, confused now!", { cacheable: true });
  }

  if (/\bsad\b/.test(lower)) {
    return compose("That hurts.", "ok, sad now!", { cacheable: true });
  }

  if (/\bhappy\b/.test(lower)) {
    return compose("Feeling good.", "ok, happy now!", { cacheable: true });
  }

  if (/\bnervous\b/.test(lower)) {
    return compose("A little shaky.", "ok, nervous now!", { cacheable: true });
  }

  if (/\bdisgust(ed)?\b|\brevuls/i.test(lower)) {
    return compose("That is unpleasant.", "ok, disgusted now!", {
      cacheable: true,
    });
  }

  if (/\bfall in love with me\b|\blovesick\b/.test(lower)) {
    return compose("Oh my...", "ok, lovesick now!", { personal: true });
  }

  if (/\bproud\b/.test(lower)) {
    return compose("I earned this.", "ok, proud now!", { cacheable: true });
  }

  if (/\bshock me\b|\bshocked\b/.test(lower)) {
    return compose("No way.", "ok, shocked now!", { cacheable: true });
  }

  if (/\bjealous\b/.test(lower)) {
    return compose("Must be nice.", "ok, jealous now!", { cacheable: true });
  }

  if (/\bsparkle\b/.test(lower)) {
    return compose("Shining now.", "ok, sparkling now!", { cacheable: true });
  }

  if (/\bon fire\b|\bset yourself on fire\b/.test(lower)) {
    return compose("This is dramatic.", "ok, on fire now!", {
      cacheable: true,
    });
  }

  if (/\bsmoke\b/.test(lower)) {
    return compose("Adding smoke.", "ok, smoking now!", { cacheable: true });
  }

  if (/\bglow\b/.test(lower)) {
    return compose("Lighting up.", "ok, glowing now!", { cacheable: true });
  }

  if (/\bremove effects\b/.test(lower)) {
    return compose("Back to normal visuals.", "ok, removing effects!", {
      cacheable: true,
    });
  }

  if (/\binvisible\b|\bgo invisible\b/.test(lower)) {
    return compose("Vanishing now.", "ok, invisible now!", { cacheable: true });
  }

  if (/\bcome back\b|\bvisible\b/.test(lower)) {
    return compose("Visible again.", "ok, visible now!", { cacheable: true });
  }

  if (/\brainbow\b/.test(lower) && !/\bstop rainbow\b/.test(lower)) {
    return compose("All colors engaged.", "ok, rainbow mode!", {
      cacheable: true,
    });
  }

  if (/\bstop rainbow\b/.test(lower)) {
    return compose("Ending rainbow mode.", "ok, stopping rainbow!", {
      cacheable: true,
    });
  }

  if (/\bdisco\b/.test(lower)) {
    return compose("Party mode.", "ok, disco mode!", { cacheable: true });
  }

  if (/\bflash\b|\bstrobe\b/.test(lower)) {
    return compose("Flashing now.", "ok, flashing now!", { cacheable: true });
  }

  if (/\bshimmer\b/.test(lower)) {
    return compose("Shimmering now.", "ok, shimmering now!", {
      cacheable: true,
    });
  }

  if (/\baura off\b/.test(lower)) {
    return compose("Aura dismissed.", "ok, aura off!", { cacheable: true });
  }

  if (/\baura\b/.test(lower)) {
    return compose("Aura on.", "ok, aura on!", { cacheable: true });
  }

  const colorMatch = lower.match(/\bturn\s+(red|blue|green|yellow|purple|orange|pink|white|black|cyan|gold|silver)\b/);
  if (colorMatch) {
    return compose("Changing color.", COLOR_COMMANDS[colorMatch[1]], {
      cacheable: true,
    });
  }

  if (/\bgrow\b|\bget big\b/.test(lower)) {
    return compose("Scaling up.", "ok, growing big now!", { cacheable: true });
  }

  if (/\bget small\b|\bshrink\b/.test(lower)) {
    return compose("Scaling down.", "ok, shrinking small now!", {
      cacheable: true,
    });
  }

  if (/\bnormal size\b/.test(lower)) {
    return compose("Returning to normal size.", "ok, normal size now!", {
      cacheable: true,
    });
  }

  if (/\bgiant\b/.test(lower)) {
    return compose("Going giant.", "ok, giant now!", { cacheable: true });
  }

  if (/\btiny\b/.test(lower)) {
    return compose("Going tiny.", "ok, tiny now!", { cacheable: true });
  }

  if (/\bscream\b/.test(lower)) {
    return compose("Here it comes.", "ok, screaming now!", { cacheable: true });
  }

  if (/\bcheer\b/.test(lower)) {
    return compose("Cheering now.", "ok, cheering now!", { cacheable: true });
  }

  if (/\bbe quiet\b|\bsilent\b/.test(lower)) {
    return compose("Going quiet.", "ok, silent now!", { cacheable: true });
  }

  if (/\bheal\b/.test(lower)) {
    return compose("Recovering.", "ok, healing now!", { cacheable: true });
  }

  if (/\bhurt\b/.test(lower)) {
    return compose("That stings.", "ok, hurt reaction!", { cacheable: true });
  }

  if (/\blow health\b/.test(lower)) {
    return compose("Health is dropping.", "ok, low health mode!", {
      cacheable: true,
    });
  }

  if (/\bbe friendly\b|\bfriendly mode\b/.test(lower)) {
    return compose("Switching modes.", "ok, switching to friendly mode!", {
      cacheable: true,
    });
  }

  if (/\bbe grumpy\b|\bgrumpy mode\b/.test(lower)) {
    return compose("Switching modes.", "ok, switching to grumpy mode!", {
      cacheable: true,
    });
  }

  if (/\bgo hyper\b|\bhyper mode\b/.test(lower)) {
    return compose("Switching modes.", "ok, switching to hyper mode!", {
      cacheable: true,
    });
  }

  if (/\bcalm down\b|\bcalm mode\b/.test(lower)) {
    return compose("Switching modes.", "ok, switching to calm mode!", {
      cacheable: true,
    });
  }

  if (/\bbe shy\b|\bshy mode\b/.test(lower)) {
    return compose("Switching modes.", "ok, switching to shy mode!", {
      cacheable: true,
    });
  }

  if (/\bguard mode\b|\bbe a guard\b/.test(lower)) {
    return compose("Switching modes.", "ok, switching to guard mode!", {
      cacheable: true,
    });
  }

  if (/\bgive me coins\b|\bfree coins\b/.test(lower)) {
    return compose(tone.denyCoins, "ok, thinking now!", { personal: true });
  }

  if (
    /\b(thank you|thanks|you helped me so much|my favorite|amazing|love you|great job)\b/.test(
      lower
    )
  ) {
    return compose("You earned that.", "ok, rewarding you!", { personal: true });
  }

  if (/\b(worst|trash|stupid|idiot|hate you)\b/.test(lower)) {
    return compose("That costs you.", "ok, fining you!", { personal: true });
  }

  if (/\bmorning\b/.test(lower)) {
    return compose("Sunrise incoming.", "ok, it's morning!", { cacheable: true });
  }

  if (/\bnoon\b/.test(lower)) {
    return compose("Setting noon.", "ok, it's noon!", { cacheable: true });
  }

  if (/\bsunset\b/.test(lower)) {
    return compose("Golden hour.", "ok, it's sunset!", { cacheable: true });
  }

  if (/\bnight\b/.test(lower)) {
    return compose("Nightfall.", "ok, it's night!", { cacheable: true });
  }

  const timeMatch = lower.match(/\bset time to\s+(\d{1,2})(?:am|pm)?\b/);
  if (timeMatch) {
    const hour = clampNumber(timeMatch[1], 0, 23, 12);
    return compose("Time adjusted.", `ok, setting time to ${hour}!`, {
      cacheable: true,
    });
  }

  if (/\bfog\b/.test(lower) && !/\bclear\b/.test(lower)) {
    return compose("Fog rolling in.", "ok, making it foggy!", {
      cacheable: true,
    });
  }

  if (/\bclear the fog\b|\bclear fog\b/.test(lower)) {
    return compose("Clearing the air.", "ok, clearing the fog!", {
      cacheable: true,
    });
  }

  const statusMatch = lower.match(/\bstatus[: ]+([a-z0-9 ]{1,20})\b/);
  if (statusMatch) {
    const statusText = statusMatch[1].trim().toUpperCase();
    return compose("Status updated.", `ok, status: ${statusText}!`, {
      cacheable: true,
    });
  }

  if (/\bclear status\b/.test(lower)) {
    return compose("Status cleared.", "ok, clearing status!", {
      cacheable: true,
    });
  }

  if (/\bscan\b/.test(lower)) {
    return compose("Scanning nearby.", "ok, scanning now!", {
      cacheable: true,
    });
  }

  if (/\bself destruct\b/.test(lower)) {
    return compose("Beginning countdown.", "ok, self destructing!", {
      personal: true,
    });
  }

  if (/\b(hi|hello|hey)\b/.test(lower)) {
    return compose(tone.ack, "ok, waving now!", { cacheable: true });
  }

  if (/\bgood morning\b/.test(lower)) {
    return compose("Good morning!", "ok, it's morning!", { cacheable: true });
  }

  if (/\bgood night\b|\bbye\b/.test(lower)) {
    return compose("Good night.", "ok, waving now!", { cacheable: true });
  }

  if (/\bhow are you\b|\bwhats up\b|\bwhat's up\b/.test(lower)) {
    return compose("Still standing.", "ok, shrugging now!", {
      cacheable: true,
    });
  }

  return null;
}

function coerceFinalResponse(rawResponse, context) {
  const parsed = parseModelResponse(rawResponse);
  if (parsed.valid) {
    return parsed;
  }

  const deterministic = getDeterministicResponse(context);
  if (deterministic) {
    return {
      valid: true,
      cleanResponse: deterministic.replace(/\s*--common$/, ""),
      cacheable: /--common$/.test(deterministic),
      type: "deterministic",
      repaired: true,
      reason: parsed.reason,
    };
  }

  const fallback = getFallbackResponse(context.personality, context.memoryNote !== "none");
  return {
    valid: true,
    cleanResponse: fallback.replace(/\s*--common$/, ""),
    cacheable: /--common$/.test(fallback),
    type: "fallback",
    repaired: true,
    reason: parsed.reason,
  };
}

function buildMemoryNote(message) {
  const preview = cleanOneLine(message).slice(0, 60);
  return `Last said: "${preview}"`;
}

function buildLinkCode() {
  let code = "";

  while (code.length < 6) {
    code += crypto
      .randomBytes(4)
      .toString("base64")
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase();
  }

  return code.slice(0, 6);
}

module.exports = {
  normalizeMessage,
  getUserKey,
  getMonthStamp,
  getUsageLimit,
  buildUserPrompt,
  parseModelResponse,
  getDeterministicResponse,
  coerceFinalResponse,
  buildMemoryNote,
  buildLinkCode,
  cleanOneLine,
};
