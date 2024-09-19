import { User } from "@prisma/client";
import { client } from "../client";
import { generateToken } from "../utils/tokens";
import { Request, Response } from "express";
import { hashPassword, isPasswordEqual } from "../utils/hashpasswords";
import stream from "stream";
import { getFileFromS3, uploadfiletos3 } from "../utils/aws";
interface UserInput {
  username: string;
  email: string;
  password: string;
}

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string; email: string }; // Define the structure of user object based on your token
}

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate req.body
    if (!req.body) {
      res.status(400).json({ message: "Request body is missing." });
      return;
    }
    const { username, email, password }: UserInput =
      req.body as unknown as UserInput;
    if (!username) throw new Error("Enter username");
    if (!email) throw new Error("Enter email");
    if (!password) throw new Error("Enter password");

    //check if the user already exists
    const isUserExists: User | null = await client.user.findFirst({
      where: { email: email },
    });

    if (isUserExists) {
      throw new Error("User already exists");
    }

    // hash password
    const hashedPassword: string = hashPassword(password);

    //create user
    const user = await client.user.create({
      data: { username, email, password: hashedPassword },
    });

    //create tokens
    const token: string = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.cookie("access_token", token, options);
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      token: token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  // Validate req.body
  try {
    if (!req.body) {
      res.status(400).json({ message: "Request body is missing." });
      return;
    }
    const { email, password }: UserInput = req.body as unknown as UserInput;

    if (!email) throw new Error("Enter email");
    if (!password) throw new Error("Enter password");

    //check if the user already exists
    const isUserExists: User | null = await client.user.findFirst({
      where: { email: email },
    });
    if (!isUserExists) {
      throw new Error("User does not exist. Please register");
    }
    if (!isPasswordEqual(password, isUserExists.password)) {
      throw new Error("Invalid password");
    }
    //create tokens
    const token: string = generateToken({
      id: isUserExists.id,
      username: isUserExists.username,
      email: isUserExists.email,
    });
    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.cookie("access_token", token, options);
    res.status(201).json({
      id: isUserExists.id,
      username: isUserExists.username,
      email: isUserExists.email,
      token: token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const uploadfile = async (req: AuthenticatedRequest, res: Response) => {
  // accept the file from req
  // check if there is a file or not
  // upload it to AWS s3
  // make a database entry
  // return the file url to the client

  try {
    const file = req.file;
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const passThroughStream = new stream.PassThrough();

    const key = `${user.id}/${file.originalname}- ${Date.now()}`;

    const response = await uploadfiletos3(
      passThroughStream,
      key,
      file.mimetype
    );

    passThroughStream.end(file.buffer);

    const userUploadedFile = await client.file.create({
      data: {
        s3Key: key,
        filename: file.originalname,
        userId: user.id,
        visibleTo: "PRIVATE",
      },
    });
    if (!userUploadedFile) {
      throw new Error("Failed to save file to database");
    }
    return res.status(200).json({ message: "Uploads successfully uploaded" });
    // Pipe the file from Multer's buffer to the PassThrough stream to S3
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Somethig failed" });
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
    return res
      .status(200)
      .json({ message: "File status updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Somethig failed" });
  }
};
