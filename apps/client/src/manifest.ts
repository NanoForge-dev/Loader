import { updateFiles } from "./files";
import { type IManifest, type IManifestFile, MANIFEST } from "./server";

export const updateManifest = async (dir: string): Promise<IManifest> => {
  const files = await updateFiles(dir);
  return { ...MANIFEST, files, version: await getVersion(files) };
};

const getVersion = async (files: IManifestFile[]) => {
  try {
    return await Bun.file("public/version").text();
  } catch {
    return fingerprintFiles(files);
  }
};

const fingerprintFiles = (files: IManifestFile[]): string => {
  const stamps = files.map(({ path, hash }) => `${path}:${hash}`).sort();
  return Bun.hash(stamps.join("|")).toString(16);
};
