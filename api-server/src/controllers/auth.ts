import { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string; email: string };
}
export const authCheck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    res.status(200).json({ message: "Authenticated" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
