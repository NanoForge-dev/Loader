import * as fs from "node:fs";
import { join } from "node:path";

/** Files of the game directory: `/virtual/path` → absolute path. */
export const getFiles = (basePath: string): [string, string][] => {
  const paths: [string, string][] = [];
  const addPath = (path: string, exportedPath: string) => {
    if (fs.statSync(path).isDirectory()) {
      for (const file of fs.readdirSync(path)) addPath(join(path, file), join(exportedPath, file));
      return;
    }
    paths.push([`/${exportedPath}`, path]);
  };
  addPath(basePath, "");
  return paths;
};
