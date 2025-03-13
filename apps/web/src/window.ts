import { IDS } from "./ids";
import { delay } from "./utils/delay.utils";
import { setHiddenStatusOnId } from "./utils/document.utils";
import { Logger } from "./utils/logger.utils";

const logger: Logger = new Logger("Window");
let totalFiles = 0;

export const changeWindowToGame = async () => {
  setHiddenStatusOnId(IDS.loader, true);
  setHiddenStatusOnId(IDS.canvas, false);
  await delay(500);
  const loader = document.getElementById(IDS.loader);
  if (loader) loader.classList.add("fade-out");
  logger.info("Change window to game");
};

export const changeWindowToLoader = async () => {
  setHiddenStatusOnId(IDS.canvas, true);
  setHiddenStatusOnId(IDS.loader, false);
  logger.info("Change window to loader");
};

export const setLoadingStatus = (filename: string, index?: number | null) => {
  const loaderFilename = document.getElementById(IDS.loaderStatus);
  const loadingBarFill = document.getElementById(IDS.loadingBar);

  if (loaderFilename) loaderFilename.innerText = filename;

  if (loadingBarFill && index && totalFiles > 0) {
    const progress = ((index + 1) / totalFiles) * 100;
    loadingBarFill.style.width = `${progress}%`;
  }
};

export const setLoadingTotalFiles = (total: number) => {
  totalFiles = total;
};
