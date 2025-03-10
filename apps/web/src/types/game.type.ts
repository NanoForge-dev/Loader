export interface IGameOptions {
  canvas: HTMLCanvasElement;
  files: {
    assets: Map<string, string>;
    scripts: Map<string, string>;
  };
}
