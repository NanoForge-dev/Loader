import { IDS } from "./ids";
import { getElementById, setHiddenStatusOnId } from "./utils/document.utils";
import { Logger } from "./utils/logger.utils";

const logger: Logger = new Logger("Window");

export const changeWindowToGame = () => {
  setHiddenStatusOnId(IDS.loader, true);
  setHiddenStatusOnId(IDS.canvas, false);
  logger.info("Change window to game");
};

export const changeWindowToLoader = () => {
  setHiddenStatusOnId(IDS.canvas, true);
  setHiddenStatusOnId(IDS.loader, false);
  logger.info("Change window to loader");
};

export const setLoadingStatus = (text: string) => {
  const el = getElementById(IDS.loaderStatus);
  el.innerText = text;
};
