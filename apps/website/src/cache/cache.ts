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

/**
 * The game-file cache lives in the Origin Private File System, which - unlike
 * `localStorage` or an in-memory cache - is shared by every tab/document open on
 * this origin. `Web Locks` serializes the destructive part of a rebuild (clearing
 * the cache directory and rewriting every file) across those tabs, so a lock name
 * scoped to this app/origin is enough; there is nothing tab-specific to add to it.
 */
const CACHE_LOCK_NAME = "nanoforge-game-cache";

/**
 * Runs `fn` while holding the cross-tab cache lock. Without this, two tabs
 * rebuilding the shared OPFS cache at the same time can race: one tab's
 * `directory.clear()` or file rewrite can invalidate a `blob:` URL another tab
 * already handed out for the same file (surfaces as e.g. a fetch/`<img>` failing
 * with `net::ERR_UPLOAD_FILE_CHANGED`, and that URL can never succeed again).
 *
 * Falls back to just running `fn` on browsers without the Web Locks API - such a
 * browser loses the cross-tab protection, but behaves exactly as it did before
 * this lock was introduced.
 */
async function withCacheLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator === "undefined" || !navigator.locks) return fn();
  // `LockGrantedCallback` is typed as `(lock) => T`, not `(lock) => T | PromiseLike<T>`,
  // even though the real API (like `setTimeout`/array callbacks elsewhere) happily
  // awaits a callback that returns a promise before releasing the lock. Awaiting
  // here lets `Awaited<...>` unwrap the resulting `Promise<Promise<T>>` correctly
  // instead of reaching for an `as` cast.
  return await navigator.locks.request(CACHE_LOCK_NAME, fn);
}

export class GameCache {
  private readonly logger: Logger = new Logger("Cache");
  private readonly fs: FileSystemManager = new FileSystemManager("game");

  async updateCache(manifest: IManifest, force = false): Promise<IExtendedManifest> {
    this.logger.info("Starting cache game files");

    let extendedManifest = await this._tryReuseCache(manifest, force);

    if (!extendedManifest) {
      extendedManifest = await withCacheLock(async () => {
        // A concurrent tab may have already rebuilt the cache for this exact
        // manifest while we were waiting for the lock - reuse its result instead
        // of redundantly clearing and re-downloading everything a second time.
        return (
          (await this._tryReuseCache(manifest, force)) ?? (await this._updateCacheProcess(manifest))
        );
      });
    }

    setVersion(manifest.version);
    this.logger.info("Game files cached");
    return extendedManifest;
  }

  private async _tryReuseCache(
    manifest: IManifest,
    force: boolean,
  ): Promise<IExtendedManifest | undefined> {
    if (force || !isManifestUpToDate(manifest)) return undefined;
    return this._parseCache(manifest);
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
