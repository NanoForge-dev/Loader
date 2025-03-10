import { env } from "./env";
import { type IManifest } from "./types/manifest.type";
import { getVersion } from "./version";
import { setLoadingStatus } from "./window";

export const getManifest = async (): Promise<IManifest> => {
  setLoadingStatus("Fetching manifest");
  const res = await fetch(`${env.PUBLIC_BASE_SERVER_URL}/manifest`);
  if (!res.ok) {
    throw new Error();
  }
  return await res.json();
};

export const isManifestUpToDate = (manifest: IManifest): boolean => {
  setLoadingStatus("Verifying manifest");
  const currentVersion = getVersion();
  if (!currentVersion || currentVersion !== manifest.version) return false;
  return false;
};
