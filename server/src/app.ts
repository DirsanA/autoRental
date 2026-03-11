import express from "express";
import cors from "cors";
import morgan from "morgan";

function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.get("/health", (req, res) => {
    return res.json({ message: "ok" });
  });
  return app;
}
export default main;
