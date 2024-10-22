import { User } from "@prisma/client";
import { client } from "../client";
import { generateToken } from "../utils/tokens";
import { Request, Response } from "express";
import { hashPassword, isPasswordEqual } from "../utils/hashpasswords";
import stream from "stream";
import { getFileFromS3, uploadfiletos3 } from "../utils/aws";
import crypto from "crypto";
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
      secure: true,
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
      sameSite: "None",
    };

    res.cookie("access_token", token, {
      httpOnly: true, // Ensures the cookie is only accessible by the web server
      secure: false, // Set false when testing locally on http
      sameSite: "lax", // Adjust based on your needs. 'Lax' works well for most cases
    });
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

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.clearCookie("access_token");
    return res.status(200).json({ message: "Logout successfully" });
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

    const s3key = `${user.id}/${file.originalname}`;

    const isFileExist = await client.file.findFirst({
      where: { s3Key: s3key },
    });

    if (isFileExist) {
      throw new Error("File already exists");
    }

    const password: string = process.env.CRYPTO_PASSWORD || "";
    const iv = crypto.randomBytes(16);
    const key = password_derive_bytes(password, "", 100, 32);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const passThroughStream = new stream.PassThrough();
    passThroughStream.pipe(cipher);

    const transaction = await client.$transaction(async (prisma) => {
      const userUploadedFile = await prisma.file.create({
        data: {
          s3Key: s3key,
          filename: file.originalname,
          userId: user.id,
          visibleTo: "PRIVATE",
          key: key.toString("hex"),
          iv: iv.toString("hex"),
          status: "PENDING",
        },
      });

      try {
        const s3UploadPromise = uploadfiletos3(cipher, s3key, file.mimetype);
        passThroughStream.end(file.buffer);
        const s3Response = await s3UploadPromise;
        await prisma.file.update({
          where: { id: userUploadedFile.id },
          data: { status: "COMPLETED" },
        });

        return { s3Response, userUploadedFile };
      } catch (s3Error) {
        await prisma.file.update({
          where: { id: userUploadedFile.id },
          data: { status: "FAILED" },
        });

        throw new Error("S3 upload failed. Transaction rolled back.");
      }
    });

    return res.status(200).json({
      message: "File successfully uploaded and saved",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Something failed" });
  }
};

export const getAllFiles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    const files = await client.file.findMany({
      where: { userId: user.id },
    });
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "No files found. Upload files" });
    }
    const newFiles = files
      .filter((file) => file.status === "COMPLETED")
      .map((file) => {
        return {
          id: file.id,
          filename: file.filename,
          publicUrl: `http://localhost:8000/files/public/${file.id}`,
          visibility: file.visibleTo,
        };
      });
    res.status(200).json(newFiles);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Somethig failed" });
  }
};

function sha1(input: Buffer) {
  return crypto.createHash("sha1").update(input).digest();
}

function password_derive_bytes(
  password: string,
  salt: string,
  iterations: number,
  len: number
) {
  let key = Buffer.from(password + salt);
  for (let i = 0; i < iterations; i++) {
    key = sha1(key);
  }
  if (key.length < len) {
    let hx = password_derive_bytes(password, salt, iterations - 1, 20);
    for (let counter = 1; key.length < len; ++counter) {
      key = Buffer.concat([
        key,
        sha1(Buffer.concat([Buffer.from(counter.toString()), hx])),
      ]);
    }
  }
  return Buffer.alloc(len, key);
}
