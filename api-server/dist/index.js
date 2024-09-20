"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const express_status_monitor_1 = __importDefault(require("express-status-monitor"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRouter_1 = require("./routes/userRouter");
const fileRouter_1 = require("./routes/fileRouter");
const crypto_1 = __importDefault(require("crypto"));
const multer_1 = __importDefault(require("multer"));
const app = (0, express_1.default)();
app.use((0, express_status_monitor_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/users", userRouter_1.userRouter);
app.use("/files", fileRouter_1.fileRouter);
const upload = (0, multer_1.default)();
const masterKey = "MASTER";
app.post("/", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file)
        return;
    const key = crypto_1.default.randomBytes(32);
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv("aes-256-cbc", key, iv);
    let encryptedFile = cipher.update(file.buffer);
    encryptedFile = Buffer.concat([encryptedFile, cipher.final()]);
    const encryptedData = encryptedFile;
    console.log(encryptedData); // this will go to s3
    // store the key,iv in database
    const keyIV = crypto_1.default.randomBytes(16);
    const Keycipher = crypto_1.default.createCipheriv("aes-256-cbc", masterKey, keyIV);
    let encryptedKey = Keycipher.update(key.toString("hex"), "utf8", "hex");
    encryptedKey += Keycipher.final("hex");
    const encryptedKeyData = encryptedKey; // this will go to database
    // ---- upload done
    // --- request
    const decipher = crypto_1.default.createDecipheriv("aes-256-cbc", masterKey, keyIV);
    let decryptedKey = decipher.update(encryptedKeyData, "hex", "utf8");
    decryptedKey += decipher.final("utf8");
    const keyBuffer = Buffer.from(decryptedKey, "hex");
    const ivBuffer = Buffer.from(keyIV.toString("hex"), "hex");
    const decipherFile = crypto_1.default.createDecipheriv("aes-256-cbc", keyBuffer, ivBuffer);
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
}));
app.listen(3000);
