import { type IGameOptions } from "../types/game.type";
import { type IExtendedManifest, type IExtendedManifestFile } from "../types/manifest.type";
import { addScript } from "../utils/document.utils";
import { Logger } from "../utils/logger.utils";

const logger = new Logger("Loader");

export const loadGameFiles = async (
  manifest: IExtendedManifest,
): Promise<[IGameOptions["files"], any]> => {
  const files = {
    assets: new Map<string, string>(),
    wasm: new Map<string, string>(),
    wgsl: new Map<string, string>(),
  };
  let mainModule = undefined;
  logger.info("Starting load game files from cache");
  for (const file of manifest.files) {
    if (file.path.endsWith(".js")) {
      const resModule = await loadScript(file);
      if (resModule) mainModule = resModule;
      continue;
    }
    if (file.path.endsWith(".wasm")) {
      files.wasm.set(file.path, file.localPath);
    } else if (file.path.endsWith(".wgsl")) {
      files.wgsl.set(file.path, file.localPath);
    } else {
      files.assets.set(file.path, file.localPath);
    }
  }
  if (!mainModule) throw new Error("Could not find main function");
  logger.info("Game files loaded");
  return [files, mainModule];
};

const loadScript = async (file: IExtendedManifestFile): Promise<any | undefined> => {
  const res = await import(file.localPath);
  if (res["main"]) return res;
  addScript(file.localPath);
};
