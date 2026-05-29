const fs = require("fs");
const path = require("path");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

const roots = ["api", "lib", "scripts"];
const loaded = [];

for (const root of roots) {
  const rootPath = path.join(process.cwd(), root);
  if (!fs.existsSync(rootPath)) {
    continue;
  }

  for (const file of walk(rootPath)) {
    require(file);
    loaded.push(path.relative(process.cwd(), file));
  }
}

console.log(`Validated ${loaded.length} JavaScript files.`);
