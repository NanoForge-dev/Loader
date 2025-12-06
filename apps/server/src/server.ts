import { createRequire } from "node:module";

import { getGameDir } from "./env";
import { getFiles } from "./files";

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

  const { main } = (await createRequire(import.meta.url)(mainPath)) as {
    main: (options: { files: Map<string, string> }) => Promise<void>;
  };

  console.log("Starting server");
  await main({ files: new Map(paths) });
};

bootstrap().then();
