import { GameCache } from "./cache/cache";
import { runGame } from "./game";
import { loadGameFiles } from "./loader";
import { getManifest } from "./manifest";
import { Logger } from "./utils/logger.utils";
import { runWatcher } from "./watch";
import { setError, setLoadingStatus } from "./window";

const logger = new Logger("Loader");

const runLoad = async () => {
  logger.info("Starting loading game");

  const manifest = await getManifest();
  runWatcher(manifest.watch);
  const cache = new GameCache();
  const extendedManifest = await cache.updateCache(manifest, true);
  const [files, mainModule] = await loadGameFiles(extendedManifest);
  setLoadingStatus("Starting game");
  runGame(mainModule, { files });
};

runLoad()
  .then(() => {
    logger.info("Game loaded !");
  })
  .catch((e) => {
    setError(e);
    logger.error(`Failed to load game : ${e}`);
  });
