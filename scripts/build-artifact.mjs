// Baut die App als eine einzige HTML-Datei (CSS + JS inline), z. B. zum
// Veröffentlichen als claude.ai-Artifact. Ausgabe: dist-artifact/mci-coach.html
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const out = "dist-artifact";
execSync(`npx vite build --outDir ${out} --emptyOutDir`, { stdio: "inherit", env: { ...process.env, BASE_PATH: "./" } });

const html = fs.readFileSync(path.join(out, "index.html"), "utf8");
const read = (ref) => fs.readFileSync(path.join(out, ref.replace(/^\.\//, "")), "utf8");
const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"/g)].map((m) => read(m[1])).join("\n");
const js = [...html.matchAll(/<script type="module"[^>]*src="([^"]+)"/g)].map((m) => read(m[1])).join("\n");

const page = `<title>MCI Coach</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#0b0f14">
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js.replaceAll("</script", "<\\/script")}
</script>
`;
fs.writeFileSync(path.join(out, "mci-coach.html"), page);
console.log(`→ ${out}/mci-coach.html (${(page.length / 1024).toFixed(0)} KB)`);
