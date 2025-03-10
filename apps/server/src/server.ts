import cors from "cors";
import Express, { type Request, type Response } from "express";
import helmet from "helmet";

import { updateManifest } from "./manifest";

export const MANIFEST: { version: string; files: { path: string }[] } = {
  version: "",
  files: [],
};

export const app = Express();

const boostrap = () => {
  const port = process.env.PORT || 8080;

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ALLOWED_ORIGINS?.split(","),
    }),
  );

  app.use("/game", Express.static("public/game"));

  app.get("/manifest", (_req: Request, res: Response) => {
    updateManifest();
    res.send(MANIFEST);
  });

  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
};

boostrap();
