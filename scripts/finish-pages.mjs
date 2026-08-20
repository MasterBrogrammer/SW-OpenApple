import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "dist/client");
let html = readFileSync(join(dir, "_shell.html"), "utf8");

const styles = readdirSync(join(dir, "assets")).find((f) =>
  /^styles-.*\.css$/.test(f),
);
if (styles) {
  html = html.replace(/assets\/styles-[^"']+\.css/g, `assets/${styles}`);
}

writeFileSync(join(dir, "index.html"), html);
writeFileSync(join(dir, "404.html"), html);
writeFileSync(join(dir, ".nojekyll"), "");

const manifest = join(dir, "__grok/manifest.webmanifest");
if (!existsSync(manifest)) {
  writeFileSync(
    manifest,
    JSON.stringify({
      name: "OpenApple",
      short_name: "OpenApple",
      start_url: "/SW-OpenApple/",
      display: "standalone",
      background_color: "#0E1014",
      theme_color: "#0E1014",
    }),
  );
}

console.log("pages: wrote index.html, 404.html, .nojekyll");
