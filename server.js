import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { router } from "./routes/route.js";
dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
  }),
);

app.get("/", (req, res) => {
  return res.json({
    message: "Welcome to the LhoShop Backend!",
  });
});

const port = process.env.PORT || 5000;

connectDB();

app.use("/api/v1", router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
