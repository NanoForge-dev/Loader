import { FileSystemManager } from "../file-system";
import {
  type IExtendedManifest,
  type IExtendedManifestFile,
  type IManifest,
  type IManifestFile,
} from "../types/manifest.type";
import { Logger } from "../utils/logger.utils";
import { setLoadingStatus, setLoadingTotalFiles } from "../window";

const CACHE_LOCK_NAME = "nanoforge-game-cache";
const CACHE_HASHES_KEY = "game-files";

type IFileHashes = Record<string, string>;

async function withCacheLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator === "undefined" || !navigator.locks) return fn();
  return await navigator.locks.request(CACHE_LOCK_NAME, fn);
}

const getFileHashes = (): IFileHashes => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_HASHES_KEY) ?? "{}");
  } catch {
    return {};
  }
};

const setFileHashes = (hashes: IFileHashes) => {
  localStorage.setItem(CACHE_HASHES_KEY, JSON.stringify(hashes));
};

export class GameCache {
  private readonly logger: Logger = new Logger("Cache");
  private readonly fs: FileSystemManager = new FileSystemManager("game");

  async updateCache(manifest: IManifest, force = false): Promise<IExtendedManifest> {
    this.logger.info("Starting cache game files");
    const extendedManifest = await withCacheLock(() =>
      this._updateCacheProcess(manifest.files, force),
    );
    this.logger.info("Game files cached");
    return extendedManifest;
  }

  private async _updateCacheProcess(
    files: IManifestFile[],
    force: boolean,
  ): Promise<IExtendedManifest> {
    const stored = force ? {} : getFileHashes();

    if (!Object.keys(stored).length) {
      setLoadingStatus("Cleaning cache game files");
      setFileHashes(stored);
      await (await this.fs.getDirectory()).clear();
    }

    const remotePaths = new Set(files.map(({ path }) => path));
    for (const path of Object.keys(stored)) {
      if (!remotePaths.has(path)) await this._removeCacheFile(path);
    }
    const hashes: IFileHashes = Object.fromEntries(
      Object.entries(stored).filter(([path]) => remotePaths.has(path)),
    );
    setFileHashes(hashes);

    setLoadingStatus("Verifying application integrity");
    const res: IExtendedManifestFile[] = [];
    const outdated: number[] = [];
    for (const [i, file] of files.entries()) {
      const cached = await this._parseFile(file, hashes);
      if (cached) res[i] = cached;
      else outdated.push(i);
    }

    setLoadingTotalFiles(outdated.length);
    for (const [n, i] of outdated.entries()) {
      const file = files[i] as IManifestFile;
      setLoadingStatus(
        `Download ${n + 1} / ${outdated.length}: ${file.path.replace(/^\/+/, "")}`,
        n,
      );
      res[i] = await this._updateCacheFile(file);
      hashes[file.path] = file.hash;
      setFileHashes(hashes);
    }

    return { files: res };
  }

  private async _updateCacheFile(fileManifest: IManifestFile): Promise<IExtendedManifestFile> {
    const res = await fetch(`/game/${fileManifest.path.replace(/^\/+/, "")}`);

    if (!res.ok) {
      let errorMessage: string;
      try {
        const errorData = await res.json();

        if (errorData.path) {
          errorMessage = `${errorData.error} : ${errorData.path}`;
        } else {
          errorMessage = errorData.error || `HTTP Error ${res.status}`;
        }
      } catch {
        errorMessage = `HTTP Error ${res.status} on file ${fileManifest.path}`;
      }
      throw new Error(errorMessage);
    }

    const file = await this.fs.getFile(fileManifest.path);

    const writable = await file.getWritable();
    await writable.write(await res.arrayBuffer());
    await writable.close();

    return {
      ...fileManifest,
      localPath: await file.getUrl(),
    };
  }

  private async _removeCacheFile(path: string): Promise<void> {
    const i = path.lastIndexOf("/");
    await this.fs
      .getDirectory(path.slice(0, i))
      .then((directory) => directory.removeChild(path.slice(i + 1)))
      .catch(() => undefined);
  }

  private async _parseFile(
    fileManifest: IManifestFile,
    hashes: IFileHashes,
  ): Promise<IExtendedManifestFile | undefined> {
    if (hashes[fileManifest.path] !== fileManifest.hash) return undefined;
    try {
      const file = await (await this.fs.getFile(fileManifest.path)).getFile();
      if (file.size !== fileManifest.size) return undefined;
      return {
        ...fileManifest,
        localPath: URL.createObjectURL(file),
      };
    } catch {
      return undefined;
    }
  }
}
