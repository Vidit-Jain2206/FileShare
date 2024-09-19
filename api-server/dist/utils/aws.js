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
exports.getPresignedUrl = exports.getFileFromS3 = exports.uploadfiletos3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3 = new aws_sdk_1.default.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const uploadfiletos3 = (passthroughStream, key, mimetype) => __awaiter(void 0, void 0, void 0, function* () {
    const s3Params = {
        Bucket: process.env.AWS_BUCKET_NAME || "",
        Key: key,
        Body: passthroughStream,
        ContentType: mimetype,
    };
    s3.upload(s3Params, (err, data) => {
        if (err) {
            throw new Error(err.message || "Failed to upload");
        }
        return data;
    });
});
exports.uploadfiletos3 = uploadfiletos3;
const getFileFromS3 = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const s3Strema = yield s3
            .getObject({
            Bucket: process.env.AWS_BUCKET_NAME || "",
            Key: file.s3Key,
        })
            .createReadStream();
        return s3Strema;
    }
    catch (error) {
        throw new Error(error.message || "Failed to download");
    }
});
exports.getFileFromS3 = getFileFromS3;
const getPresignedUrl = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = s3.getSignedUrl("getObject", {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.s3Key,
            Expires: 60 * 10, // Pre-signed URL expires in 10 minutes
        });
        return url;
    }
    catch (error) {
        throw new Error(error.message || "Internal Server Error");
    }
});
exports.getPresignedUrl = getPresignedUrl;
