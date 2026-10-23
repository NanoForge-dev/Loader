import { type IManifest } from "./types/manifest.type";
import { setLoadingStatus } from "./window";

export const getManifest = async (): Promise<IManifest> => {
  setLoadingStatus("Fetching manifest");
  const res = await fetch(`/manifest`);
  if (!res.ok) {
    throw new Error();
  }
  return await res.json();
};
