import * as fs from "node:fs";

import { MANIFEST } from "./server";

export const updateFiles = () => {
  addPath("public/game", "");
};

const addPath = (path: string, exportedPath: string) => {
  if (fs.statSync(path).isDirectory()) {
    fs.readdirSync(path).forEach((file) => {
      addPath(`${path}/${file}`, `${exportedPath}/${file}`);
    });
    return;
  }
  MANIFEST.files.push({
    path: exportedPath,
  });
};
