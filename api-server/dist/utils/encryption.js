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
exports.getEncrptkey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const masterKey = "FILE_ENCRYPTION_KEY";
const getEncrptkey = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const iv = crypto_1.default.randomBytes(16); // Generate a new IV for each encryption
    const cipher = crypto_1.default.createCipheriv("aes-256-cbc", masterKey, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return { encrypted, iv: iv.toString("hex") };
});
exports.getEncrptkey = getEncrptkey;
const decryptKey = (encrypted, iv) => {
    const decipher = crypto_1.default.createDecipheriv("aes-256-cbc", masterKey, Buffer.from(iv, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
