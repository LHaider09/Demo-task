import express from "express";
import cors from "cors";
import { peopleRouter } from "./routes/people.routes";
import { ApiError } from "./errors/apiError";
import { relationshipsRouter } from "./routes/relationships.routes";
import { treeRouter } from "./routes/tree.routes";



export function buildApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/people", peopleRouter);
  app.use("/api/relationships", relationshipsRouter);
  app.use("/api/tree", treeRouter);



  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
  });
  

  // error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    if (err instanceof ApiError) {
      return res.status(err.status).json({
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      });
    }

    console.error(err);
    return res.status(500).json({
      error: { code: "INTERNAL", message: "Unexpected server error" },
    });
  });

  return app;
}
