import { createRequire } from "node:module";

import { createIpcEditor } from "./editor-ipc";
import { getGameEnv } from "./env";

const bootstrap = async () => {
  const mainPath = process.argv[2] as string;
  const paths = JSON.parse(process.argv[3] as string);
  const { main } = (await createRequire(import.meta.url)(mainPath)) as {
    main: (options: {
      files: Map<string, string>;
      env: Record<string, string | undefined>;
      editor?: ReturnType<typeof createIpcEditor>;
    }) => Promise<void>;
  };

  const editor = process.env.NANOFORGE_EDITOR_IPC === "1" ? createIpcEditor(process) : undefined;
  // The loader relays the editor: stop with it.
  if (editor) process.on("disconnect", () => process.exit(0));
  console.log("Starting server");
  await main({ files: new Map(paths), env: getGameEnv(), ...(editor && { editor }) });
};

bootstrap().then();
