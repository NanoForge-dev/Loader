import { updateFiles } from "./files";
import { MANIFEST } from "./server";

export const updateManifest = async (dir: string) => {
  MANIFEST.files = [];
  await updateFiles(dir);
  MANIFEST.version = await getVersion(dir);
};

const getVersion = async (dir: string) => {
  try {
    return await Bun.file("public/version").text();
  } catch {
    return await fingerprintFiles(dir);
  }
};

// Falls back to a fingerprint of the actual served files when there's no explicit
// `public/version` (the common case for local dev/build - there's nothing else here
// that changes across rebuilds). Without this, the version stays a constant "0.0.0"
// forever, so the loader always thinks its cached copy is up to date and never
// re-downloads a rebuilt game - stale code keeps getting served indefinitely.
const fingerprintFiles = async (dir: string): Promise<string> => {
  const stamps = await Promise.all(
    MANIFEST.files.map(async ({ path }) => {
      try {
        const stat = await Bun.file(`${dir}${path}`).stat();
        return `${path}:${stat.size}:${stat.mtimeMs}`;
      } catch {
        return `${path}:missing`;
      }
    }),
  );
  stamps.sort();
  return Bun.hash(stamps.join("|")).toString(16);
};
