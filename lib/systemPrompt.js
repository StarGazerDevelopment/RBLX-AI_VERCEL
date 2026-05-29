const fs = require("fs");
const path = require("path");

let cachedPrompt = null;

function getSystemPrompt() {
  if (cachedPrompt) {
    return cachedPrompt;
  }

  const instructionsPath = path.join(process.cwd(), "instructions.txt");
  const raw = fs.readFileSync(instructionsPath, "utf8");
  const startIndex = raw.indexOf("You are NoobAI.");
  const partBIndex = raw.indexOf("PART B");

  if (startIndex === -1) {
    throw new Error("Could not find NoobAI system prompt in instructions.txt");
  }

  const sliceEnd = partBIndex === -1 ? raw.length : partBIndex;
  cachedPrompt = raw.slice(startIndex, sliceEnd).trim();
  return cachedPrompt;
}

module.exports = {
  getSystemPrompt,
};
