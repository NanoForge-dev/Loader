export const getGameDir = () => {
  if (process.env.GAME_DIR) return process.env.GAME_DIR;
  throw new Error("GAME_DIR env variable not found");
};
