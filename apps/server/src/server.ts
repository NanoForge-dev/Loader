import { join } from "node:path";

import { updateManifest } from "./manifest";

export const MANIFEST: { version: string; files: { path: string }[] } = {
  version: "",
  files: [],
};

const port = process.env.PORT || 8080;
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
const gameDir = process.env.GAME_DIR || "public/game";

const headers = {
  "Access-Control-Allow-Origin": clientUrl,
  "Access-Control-Allow-Methods": "GET",
};

const server = Bun.serve({
  port: port,
  routes: {
    "/manifest": async () => {
      await updateManifest(gameDir);
      return Response.json(MANIFEST, {
        headers,
      });
    },
    "/game/*": (req) => {
      const path = new URL(req.url).pathname.replace("/game", "");
      const file = Bun.file(join(gameDir, path));
      return new Response(file, {
        headers,
      });
    },
  },
});

console.log(`Server started on port ${server.port}`);
