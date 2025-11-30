import { GAME_EXPOSURE_URL } from "../env.json";
import { FileSystemManager } from "../file-system";
import { isManifestUpToDate } from "../manifest";
import {
  type IExtendedManifest,
  type IExtendedManifestFile,
  type IManifest,
  type IManifestFile,
} from "../types/manifest.type";
import { Logger } from "../utils/logger.utils";
import { setVersion } from "../version";
import { setLoadingStatus, setLoadingTotalFiles } from "../window";

export class GameCache {
  private readonly logger: Logger = new Logger("Cache");
  private readonly fs: FileSystemManager = new FileSystemManager("game");

  async updateCache(manifest: IManifest, force = false): Promise<IExtendedManifest> {
    this.logger.info("Starting cache game files");
    let extendedManifest: IExtendedManifest | undefined = await this._parseCache(manifest);
    if (force || !isManifestUpToDate(manifest) || !extendedManifest)
      extendedManifest = await this._updateCacheProcess(manifest);
    setVersion(manifest.version);
    this.logger.info("Game files cached");
    return extendedManifest as IExtendedManifest;
  }

  private async _updateCacheProcess(manifest: IManifest): Promise<IExtendedManifest> {
    setLoadingStatus("Cleaning cache game files");
    const directory = await this.fs.getDirectory();
    await directory.clear();
    return {
      files: await this._updateCacheFiles(manifest.files),
    };
  }

  private async _updateCacheFiles(files: IManifestFile[]): Promise<IExtendedManifestFile[]> {
    const res = [];
    setLoadingTotalFiles(files.length);
    for (const [i, file] of files.entries()) {
      setLoadingStatus(`Download: ${file.path.replace(/^\/+/, "")}`, i);
      res.push(await this._updateCacheFile(file));
    }
    return res;
  }

  private async _updateCacheFile(fileManifest: IManifestFile): Promise<IExtendedManifestFile> {
    const res = await fetch(`${GAME_EXPOSURE_URL}/game/${fileManifest.path}`);

    const file = await this.fs.getFile(fileManifest.path);

    const writable = await file.getWritable();
    await writable.write(await res.arrayBuffer());
    await writable.close();

    return {
      ...fileManifest,
      localPath: await file.getUrl(),
    };
  }

  private async _parseCache(manifest: IManifest): Promise<IExtendedManifest | undefined> {
    setLoadingStatus("Verifying application integrity");
    return this._parseFiles(manifest.files);
  }

  private async _parseFiles(files: IManifestFile[]): Promise<IExtendedManifest | undefined> {
    const res = [];
    for (const file of files) {
      const r = await this._parseFile(file);
      if (!r) return undefined;
      res.push(r);
    }
    return {
      files: res,
    };
  }

  /**
   * @todo Function to verify if the file passed in parameters exist
   * @todo Verify if the file passed in parameters is really complete
   */
  private async _parseFile(
    fileManifest: IManifestFile,
  ): Promise<IExtendedManifestFile | undefined> {
    try {
      const file = await this.fs.getFile(fileManifest.path);
      return {
        ...fileManifest,
        localPath: await file.getUrl(),
      };
    } catch {
      return undefined;
    }
  }
}
