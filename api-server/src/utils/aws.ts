import { Readable } from "stream";

import AWS from "aws-sdk";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const uploadfiletos3 = async (
  stream: Readable,
  key: string,
  mimetype: string
): Promise<any> => {
  const s3Params = {
    Bucket: process.env.AWS_BUCKET_NAME || "",
    Key: key,
    Body: stream,
    ContentType: mimetype,
  };
  s3.upload(s3Params, (err: any, data: any) => {
    if (err) {
      throw new Error(err.message || "Failed to upload");
    }
    return data;
  });
};

export const getFileFromS3 = async (file: {
  id: string;
  s3Key: string;
  filename: string;
}) => {
  try {
    const s3Strema = await s3
      .getObject({
        Bucket: process.env.AWS_BUCKET_NAME || "",
        Key: file.s3Key,
      })
      .createReadStream();
    return s3Strema;
  } catch (error: any) {
    throw new Error(error.message || "Failed to download");
  }
};

export const getPresignedUrl = async (file: {
  id: string;
  s3Key: string;
  filename: string;
}) => {
  try {
    const url = s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.s3Key,
      Expires: 60 * 10, // Pre-signed URL expires in 10 minutes
    });
    return url;
  } catch (error: any) {
    throw new Error(error.message || "Internal Server Error");
  }
};
