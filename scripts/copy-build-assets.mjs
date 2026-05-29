import { copyFile, mkdir } from "node:fs/promises";

await mkdir("dist/assets", { recursive: true });
await copyFile("sw.js", "dist/sw.js");
await copyFile("assets/routepilot-cover.png", "dist/assets/routepilot-cover.png");
