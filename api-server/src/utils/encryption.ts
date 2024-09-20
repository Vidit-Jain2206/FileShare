import crypto from "crypto";

const masterKey = "FILE_ENCRYPTION_KEY";

export const getEncrptkey = async (data: string) => {
  const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
  const cipher = crypto.createCipheriv("aes-256-cbc", masterKey, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encrypted, iv: iv.toString("hex") };
};

const decryptKey = (encrypted: string, iv: string) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    masterKey,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
