import "dotenv/config";
import express from "express";
import statusMonitor from "express-status-monitor";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/userRouter";
import { fileRouter } from "./routes/fileRouter";
import crypto from "crypto";
import multer from "multer";
import cors from "cors";
import { authRouter } from "./routes/authRouter";
const app = express();

app.use(statusMonitor());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173/",
    credentials: true,
  })
);

app.use("/users", userRouter);
app.use("/files", fileRouter);
app.use("/auth", authRouter);

const upload = multer();

const masterKey = "MASTER";

app.post("/", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return;

  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encryptedFile = cipher.update(file.buffer);
  encryptedFile = Buffer.concat([encryptedFile, cipher.final()]);
  const encryptedData = encryptedFile;

  console.log(encryptedData); // this will go to s3

  // store the key,iv in database
  const keyIV = crypto.randomBytes(16);

  const Keycipher = crypto.createCipheriv("aes-256-cbc", masterKey, keyIV);
  let encryptedKey = Keycipher.update(key.toString("hex"), "utf8", "hex");
  encryptedKey += Keycipher.final("hex");
  const encryptedKeyData = encryptedKey; // this will go to database

  // ---- upload done

  // --- request

  const decipher = crypto.createDecipheriv("aes-256-cbc", masterKey, keyIV);
  let decryptedKey = decipher.update(encryptedKeyData, "hex", "utf8");
  decryptedKey += decipher.final("utf8");

  const keyBuffer = Buffer.from(decryptedKey, "hex");
  const ivBuffer = Buffer.from(keyIV.toString("hex"), "hex");
  const decipherFile = crypto.createDecipheriv(
    "aes-256-cbc",
    keyBuffer,
    ivBuffer
  );
  const decryptedData = Buffer.concat([
    decipherFile.update(encryptedData),
    decipherFile.final(),
  ]);
  res.end(decryptedData.buffer);
  // const pt = key.toString("hex");
  // //   console.log(iv.toString("hex"));

  // const keyBuffer = Buffer.from(encryptedKey);
  // console.log(keyBuffer);

  // const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  // console.log(cipher);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
