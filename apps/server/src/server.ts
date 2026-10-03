import { program } from "commander";
import { type ChildProcess, fork } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getFiles } from "./files";
import { startWatch } from "./watch";

const bootstrap = async () => {
  program
    .name("server loader")
    .description("run server loader")
    .option("-d, --dir <dir>", "dir of the game")
    .option("--watch", "watch the game dir", false)
    .option(
      "--editor-ipc",
      "bridge the game to the editor that started this process, over its IPC channel",
      false,
    )
    .parse();

  const { dir, watch, editorIpc } = program.opts<{
    dir: string;
    watch: boolean;
    editorIpc: boolean;
  }>();
  if (editorIpc && !process.send) throw new Error("--editor-ipc needs an IPC channel");

  if (!dir) throw new Error("No game dir specified");

  let mainPath: string | undefined = undefined;
  const paths = getFiles(dir).filter(([path, fullPath]) => {
    if (path !== "/main.js") return true;
    mainPath = resolve(fullPath);
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
    child = fork(
      join(dirname(__filename), "worker.js"),
      [mainPath as string, JSON.stringify(paths)],
      { env: editorIpc ? { ...process.env, NANOFORGE_EDITOR_IPC: "1" } : process.env },
    );
    if (editorIpc) child.on("message", (message) => process.send?.(message));
  };

  if (editorIpc) {
    process.on("message", (message) => {
      if (child && child.exitCode === null) child.send(message as object);
    });
  }

  if (watch) startWatch(dir, runWorker);

  await runWorker();
};

bootstrap().then();
