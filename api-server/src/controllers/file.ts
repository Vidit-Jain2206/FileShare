import { client } from "../client";

import { Request, Response } from "express";

import { getFileFromS3, getPresignedUrl } from "../utils/aws";

export const getFile = async (req: Request, res: Response) => {
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
    // check if status of file is PUBLIC or not
    if (file.visibleTo !== "PUBLIC") {
      throw new Error("File is not publicly available");
    }

    // get the file from s3 and stream it to response
    const s3Stream = await getFileFromS3(file);
    s3Stream.pipe(res);

    s3Stream.on("error", (err) => {
      console.error("Error streaming file from S3:", err);
      res.status(500).json({ message: "Error retrieving file" });
    });

    // const url = await getPresignedUrl(file);
    // res.redirect(url);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
