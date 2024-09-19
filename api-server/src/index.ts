import "dotenv/config";
import express from "express";
import statusMonitor from "express-status-monitor";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/userRouter";
import { fileRouter } from "./routes/fileRouter";

const app = express();

app.use(statusMonitor());
app.use(express.json());
app.use(cookieParser());

app.use("/users", userRouter);
app.use("/files", fileRouter);

app.listen(3000);
