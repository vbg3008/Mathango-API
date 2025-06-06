import express from "express";
import { configDotenv } from "dotenv";
import connectDB from "./connectDB.js";
import rateLimiter from "./middleware/rateLimiter.js";
import chapterRoutes from "./routes/chapterRoutes.js";

configDotenv();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB().then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server running on port ${process.env.PORT || 8000}`);
  });
});

app.use(rateLimiter);
app.set("trust proxy", true);

app.get("/", (req, res) => {
  res.send("<h1>Hello</h1>");
});

app.use("/api/v1/chapters", chapterRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    message: "Internal server error",
  });
});

export default app;
