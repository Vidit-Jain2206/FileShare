import { Router } from "express";
import {
  changeFileStatus,
  getFilePrivate,
  getFilePublic,
} from "../controllers/file";
import { authenticateJwt } from "../middleware/authentication";

export const fileRouter = Router();

fileRouter.get("/public/:fileId", getFilePublic);
fileRouter.get("/private/:fileId", authenticateJwt, getFilePrivate);
fileRouter.post("/change-status", authenticateJwt, changeFileStatus);
