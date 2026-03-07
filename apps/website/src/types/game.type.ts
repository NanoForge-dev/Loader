export interface IGameOptions {
  canvas: HTMLCanvasElement;
  files: Map<string, string>;
  env: Record<string, string | undefined>;
}
