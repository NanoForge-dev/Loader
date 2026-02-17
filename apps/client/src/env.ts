export const getPublicEnv = () => {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key.startsWith("PUBLIC_")),
  );
};

export const getPort = () => {
  if (process.env.PORT) return process.env.PORT;
  throw new Error("PORT env variable not found");
};

export const getGameDir = () => {
  if (process.env.GAME_DIR) return process.env.GAME_DIR;
  throw new Error("GAME_DIR env variable not found");
};

export const getCert = () => {
  if (process.env.CERT) return process.env.CERT;
  else return undefined;
};

export const getKey = () => {
  if (process.env.KEY) return process.env.KEY;
  else return undefined;
};

export const getWatch = () => {
  return process.env.WATCH;
};

export const getWatchPort = () => {
  return process.env.WATCH_PORT;
};

export const getWatchServerGameDir = () => {
  return process.env.WATCH_SERVER_GAME_DIR;
};
