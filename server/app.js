import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import excelRoutes from "./routes/excel.routes.js";
import clientRoutes from "./routes/client.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import transformationRoutes from "./routes/transformation.routes.js";
import monthlyPlanRoutes from "./routes/monthlyPlan.routes.js";
import weeklyPlanRoutes from "./routes/weeklyPlan.routes.js";
import whatIfRoutes from "./routes/whatIf.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import reportRoutes from "./routes/report.routes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Transformation AI POC Backend is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is healthy"
  });
});

app.use("/api/excel", excelRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/transformation", transformationRoutes);
app.use("/api/monthly-plans", monthlyPlanRoutes);
app.use("/api/weekly-plans", weeklyPlanRoutes);
app.use("/api/what-if", whatIfRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  const statusCode =
    err.statusCode ||
    (err.name === "ZodError" ? 422 : 400);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});