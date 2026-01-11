import { createRequire } from "node:module";

const bootstrap = async () => {
  const mainPath = process.argv[2] as string;
  const paths = JSON.parse(process.argv[3] as string);
  const { main } = (await createRequire(import.meta.url)(mainPath)) as {
    main: (options: { files: Map<string, string> }) => Promise<void>;
  };

  console.log("Starting server");
  await main({ files: new Map(paths) });
};

bootstrap().then();
