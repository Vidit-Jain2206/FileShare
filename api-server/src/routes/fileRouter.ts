import { Router } from "express";
import { getFile } from "../controllers/file";

export const fileRouter = Router();

fileRouter.get("/file/:fileId", getFile);
