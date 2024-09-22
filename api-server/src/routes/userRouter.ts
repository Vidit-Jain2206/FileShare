import { Router } from "express";
import multer from "multer";
import {
  getAllFiles,
  loginUser,
  registerUser,
  uploadfile,
} from "../controllers/user";
import { authenticateJwt } from "../middleware/authentication";

const upload = multer();
export const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/uploads", authenticateJwt, upload.single("file"), uploadfile);
userRouter.get("/files", authenticateJwt, getAllFiles);
