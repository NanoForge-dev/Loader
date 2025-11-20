import { updateFiles } from "./files";
import { MANIFEST } from "./server";

export const updateManifest = async (dir: string) => {
  MANIFEST.version = await getVersion();
  MANIFEST.files = [];
  await updateFiles(dir);
};

const getVersion = async () => {
  try {
    return await Bun.file("public/version").text();
  } catch {
    return "0.0.0";
  }
};
