import { join } from "node:path";

import {
  getGameDir,
  getPort,
  getPublicEnv,
  getWatch,
  getWatchPort,
  getWatchServerGameDir,
} from "./env";
import { updateManifest } from "./manifest";
import { startWatch } from "./watch";

type IManifest = {
  version: string;
  files: { path: string }[];
  watch: { enable: false } | { enable: true; url: string };
};

const watch = getWatch() === "true";

export const MANIFEST: IManifest = {
  version: "",
  files: [],
  watch: {
    enable: false,
  },
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

console.log(`Client started on url ${server.url.toString()}`);

if (watch) startWatch(gameDir, getWatchPort(), getWatchServerGameDir());
