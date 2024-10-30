import { Router } from "express";
import {
  changeFileStatus,
  deleteFile,
  getFilePrivate,
  getFilePublic,
} from "../controllers/file";
import { authenticateJwt } from "../middleware/authentication";

export const fileRouter = Router();

fileRouter.get("/public/:fileId", getFilePublic);
fileRouter.get("/private/:fileId", authenticateJwt, getFilePrivate);
fileRouter.put("/change-status", authenticateJwt, changeFileStatus);
fileRouter.delete("/delete-file/:fileId", authenticateJwt, deleteFile);
