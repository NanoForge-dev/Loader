import { watch } from "fs";

import { MANIFEST } from "./server";

export const startWatch = (gameDir: string, port?: string) => {
  const server = Bun.serve({
    port: port ?? 0,
    fetch(req, server) {
      if (server.upgrade(req)) {
        return;
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
      message(ws) {
        ws.send("not allowed");
      },
      open(ws) {
        ws.subscribe("watch");
      },
      close(ws) {
        ws.unsubscribe("watch");
      },
    },
  });

  MANIFEST.watch = {
    enable: true,
    url: server.url.toString(),
  };

  watch(gameDir, { recursive: true }, () => {
    server.publish("watch", "update");
    console.log(`Game updated`);
  });

  console.log(`Watcher started on url ${server.url.toString()}`);
};
