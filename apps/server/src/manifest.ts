import * as fs from "fs";

import { updateFiles } from "./files";
import { MANIFEST } from "./server";

export const updateManifest = () => {
  MANIFEST.version = getVersion();
  MANIFEST.files = [];
  updateFiles();
};

const getVersion = () => {
  return fs.readFileSync("public/version", "utf8");
};
