import { type ChildProcess, fork } from "node:child_process";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { getGameDir, getWatch } from "./env";
import { getFiles } from "./files";
import { startWatch } from "./watch";

const bootstrap = async () => {
  const gameDir = getGameDir();

  const paths = getFiles(gameDir);
  let mainPath: string | undefined = undefined;

  paths.filter(([path, fullPath]) => {
    if (path !== "/main.js") return true;
    mainPath = fullPath;
    return false;
  });

  if (!mainPath) throw new Error("No main.js found");

  let child: ChildProcess | undefined;

  const runWorker = async () => {
    if (child) {
      child.kill();
      child = undefined;
    }

    const __filename = fileURLToPath(import.meta.url);
    child = fork(join(dirname(__filename), "worker.js"), [
      mainPath as string,
      JSON.stringify(paths),
    ]);
  };

  if (getWatch()) startWatch(gameDir, runWorker);

  await runWorker();
};

bootstrap().then();
