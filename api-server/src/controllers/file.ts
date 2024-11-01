import { client } from "../client";

import { Request, Response } from "express";
import crypto from "crypto";

import {
  deleteObjectFromS3,
  getFileFromS3,
  getPresignedUrl,
  uploadfiletos3,
} from "../utils/aws";

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string; email: string }; // Define the structure of user object based on your token
}

export const getFilePublic = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      throw new Error("Invalid request params");
    }
    const file = await client.file.findFirst({
      where: { id: fileId },
      include: { user: true },
    });
    if (!file) {
      throw new Error("File not found");
    }
    if (file.visibleTo !== "PUBLIC") {
      throw new Error("File is not publicly available");
    }
    const s3Stream = await getFileFromS3(file);
    const key = Buffer.from(file.key, "hex");
    const iv = Buffer.from(file.iv, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    s3Stream.pipe(decipher).pipe(res);

    s3Stream.on("error", (err) => {
      console.error("Error streaming file from S3:", err);
      res.status(500).json({ message: "Error retrieving file" });
    });

    decipher.on("error", (err) => {
      console.error("Error decrypting the file:", err);
      res.status(500).json({ message: "Error decrypting file" });
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
export const getFilePrivate = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { fileId } = req.params;
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    if (!fileId) {
      throw new Error("Invalid request params");
    }
    const file = await client.file.findFirst({
      where: { id: fileId },
      include: { user: true },
    });
    if (!file) {
      throw new Error("File not found");
    }

    if (file.userId !== user.id) {
      throw new Error("Unauthorized access");
    }

    const s3Stream = await getFileFromS3(file);
    const key = Buffer.from(file.key, "hex");
    const iv = Buffer.from(file.iv, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    s3Stream.pipe(decipher).pipe(res);
    s3Stream.on("error", (err) => {
      console.error("Error streaming file from S3:", err);
      res.status(500).json({ message: "Error retrieving file" });
    });
    decipher.on("error", (err) => {
      console.error("Error decrypting the file:", err);
      res.status(500).json({ message: "Error decrypting file" });
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
export const changeFileStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    const { fileId, status } = req.body;
    if (!fileId || !status) {
      throw new Error("Invalid request body");
    }

    const file = await client.file.findFirst({
      where: { id: fileId, userId: user.id },
    });
    if (!file) {
      throw new Error("File not found or not belong to the user");
    }
    await client.file.update({
      where: { id: fileId },
      data: { visibleTo: status },
    });
    if (status === "PUBLIC") {
      return res.status(200).json({
        publicURL: `http://13.202.240.229/files/public/${fileId}`,
        message: "File status updated successfully",
      });
    }
    return res.status(200).json({
      message: "File status updated successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Somethig failed" });
  }
};

export const deleteFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      throw new Error("Invalid request params");
    }
    const file = await client.file.findFirst({ where: { id: fileId } });
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    if (!file) {
      throw new Error("File not found");
    }
    if (file.userId !== user.id) {
      throw new Error("Unauthorized access");
    }
    // delete the file from s3 and database in one transaction

    const transaction = await client.$transaction(async (client) => {
      const fileBackup = await getFileFromS3({ s3Key: file.s3Key });
      let s3delete = false;
      try {
        await deleteObjectFromS3(file.s3Key);
        s3delete = true;
        await client.file.delete({ where: { id: fileId } });
        return res.status(200).json({ message: "File deleted successfully" });
      } catch (error) {
        if (s3delete && fileBackup) {
          //reupload the file backup
          try {
            await uploadfiletos3(fileBackup, file.s3Key);
          } catch (error) {
            throw new Error("error reuplaod file backup");
          }
        }
        throw new Error("Failed to delete file from S3");
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
