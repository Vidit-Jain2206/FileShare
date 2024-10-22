import "dotenv/config";
import express from "express";
import statusMonitor from "express-status-monitor";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/userRouter";
import { fileRouter } from "./routes/fileRouter";
import crypto, { randomBytes } from "crypto";
import multer from "multer";
import cors from "cors";
import path from "path";
import { authRouter } from "./routes/authRouter";
const app = express();

app.use(statusMonitor());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.use("/users", userRouter);
app.use("/files", fileRouter);
app.use("/auth", authRouter);

// app.use("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
// });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
