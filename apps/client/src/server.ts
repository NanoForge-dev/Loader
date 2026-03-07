import { program } from "commander";
import { join } from "node:path";

import { getGameEnv } from "./env";
import { updateManifest } from "./manifest";
import { startWatch } from "./watch";

type IManifest = {
  version: string;
  files: { path: string }[];
  watch: { enable: false } | { enable: true; url: string };
};

program
  .name("client loader")
  .description("run client loader")
  .option("-p, --port <port>", "port of the client", "3000")
  .option("-d, --dir <dir>", "dir of the game", ".nanoforge/client")
  .option("--watch", "watch the game dir", false)
  .option("--watch-port <watch port>", "port for watch websocket (default: first port available)")
  .option("--watch-server-dir <watch server dir>", "dir of the server for watch it too")
  .option("--cert <cert>", "cert file for https")
  .option("--key <key>", "key file for https")
  .parse();

const { port, dir, watch, watchPort, watchServerDir, cert, key } = program.opts<{
  port: string;
  dir: string;
  watch: boolean;
  watchPort?: string;
  watchServerDir?: string;
  cert?: string;
  key?: string;
}>();

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

const headers = {
  "Access-Control-Allow-Methods": "GET",
};

const tls = cert && key ? { cert: Bun.file(cert), key: Bun.file(key) } : undefined;

const server = Bun.serve({
  port: port,
  tls: tls,
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
      await updateManifest(dir);
      return Response.json(MANIFEST, {
        headers,
      });
    },
    "/env": () => {
      return Response.json(getGameEnv(), { headers });
    },
    "/game/*": (req) => {
      const path = new URL(req.url).pathname.replace("/game", "");
      const file = Bun.file(join(dir, path));
      return new Response(file, {
        headers,
      });
    },
  },
});

console.log(`Client started on url ${server.url.toString()}`);

if (watch) startWatch(dir, watchPort, watchServerDir);
