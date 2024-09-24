import { Router } from "express";
import { authCheck } from "../controllers/auth";
import { authenticateJwt } from "../middleware/authentication";

export const authRouter = Router();

authRouter.get("/check", authenticateJwt, authCheck);
