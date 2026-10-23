import { readdir } from "node:fs/promises";

import { type IManifestFile } from "./server";

const HASHES = new Map<string, { stamp: string; hash: string }>();

export const updateFiles = async (dir: string) => {
  const files: IManifestFile[] = [];
  await addPath(files, dir, "");
  return files;
};

const addPath = async (files: IManifestFile[], path: string, exportedPath: string) => {
  try {
    const stat = await Bun.file(path).stat();
    if (stat.isDirectory()) {
      for (const file of await readdir(path)) {
        await addPath(files, `${path}/${file}`, `${exportedPath}/${file}`);
      }
      return;
    }
    files.push({
      path: exportedPath,
      hash: await getHash(path, `${stat.size}:${stat.mtimeMs}`),
      size: stat.size,
    });
  } catch (e) {
    console.error(e);
  }
};

const getHash = async (path: string, stamp: string) => {
  const cached = HASHES.get(path);
  if (cached?.stamp === stamp) return cached.hash;
  const hash = new Bun.CryptoHasher("sha256")
    .update(await Bun.file(path).arrayBuffer())
    .digest("hex");
  HASHES.set(path, { stamp, hash });
  return hash;
};
