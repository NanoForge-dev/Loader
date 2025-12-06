import { join } from "node:path";

import { getGameDir, getPort, getPublicEnv } from "./env";
import { updateManifest } from "./manifest";

export const MANIFEST: { version: string; files: { path: string }[] } = {
  version: "",
  files: [],
};

const resolveWebDir = (str: string) => {
  return import.meta
    .resolve(`@nanoforge-dev/loader-website/${str.replace(/^\//, "")}`)
    .replace(/^file:\/\//, "");
};

const port = getPort();
const gameDir = getGameDir();

const headers = {
  "Access-Control-Allow-Methods": "GET",
};

const server = Bun.serve({
  port: port,
  routes: {
    "/": () => {
      const file = Bun.file(resolveWebDir("index.html"));
      return new Response(file, {
        headers,
      });
    },
    "/*": async (req) => {
      try {
        const path = new URL(req.url).pathname;
        const file = Bun.file(resolveWebDir(path));

        if (!(await file.exists()))
          return new Response(null, {
            status: 404,
          });

        return new Response(file, {
          headers,
        });
      } catch {
        return new Response(null, {
          status: 404,
        });
      }
    },
    "/manifest": async () => {
      await updateManifest(gameDir);
      return Response.json(MANIFEST, {
        headers,
      });
    },
    "/env": () => {
      return Response.json(getPublicEnv(), { headers });
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

console.log(`Client started on port ${server.port}`);
