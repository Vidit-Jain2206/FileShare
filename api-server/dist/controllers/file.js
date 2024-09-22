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
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeFileStatus = exports.getFilePrivate = exports.getFilePublic = void 0;
const client_1 = require("../client");
const aws_1 = require("../utils/aws");
const getFilePublic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileId } = req.params;
        if (!fileId) {
            throw new Error("Invalid request params");
        }
        const file = yield client_1.client.file.findFirst({
            where: { id: fileId },
            include: { user: true },
        });
        if (!file) {
            throw new Error("File not found");
        }
        if (file.visibleTo !== "PUBLIC") {
            throw new Error("File is not publicly available");
        }
        const s3Stream = yield (0, aws_1.getFileFromS3)(file);
        s3Stream.pipe(res);
        s3Stream.on("error", (err) => {
            console.error("Error streaming file from S3:", err);
            res.status(500).json({ message: "Error retrieving file" });
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
});
exports.getFilePublic = getFilePublic;
const getFilePrivate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileId } = req.params;
        const user = req.user;
        if (!user) {
            throw new Error("User not found");
        }
        if (!fileId) {
            throw new Error("Invalid request params");
        }
        const file = yield client_1.client.file.findFirst({
            where: { id: fileId },
            include: { user: true },
        });
        if (!file) {
            throw new Error("File not found");
        }
        if (file.userId !== user.id) {
            throw new Error("Unauthorized access");
        }
        // get the file from s3 and stream it to response
        const s3Stream = yield (0, aws_1.getFileFromS3)(file);
        s3Stream.pipe(res);
        s3Stream.on("error", (err) => {
            console.error("Error streaming file from S3:", err);
            res.status(500).json({ message: "Error retrieving file" });
        });
        // const url = await getPresignedUrl(file);
        // res.redirect(url);
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
});
exports.getFilePrivate = getFilePrivate;
const changeFileStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("User not found");
        }
        const { fileId, status } = req.body;
        if (!fileId || !status) {
            throw new Error("Invalid request body");
        }
        const file = yield client_1.client.file.findFirst({
            where: { id: fileId, userId: user.id },
        });
        if (!file) {
            throw new Error("File not found or not belong to the user");
        }
        yield client_1.client.file.update({
            where: { id: fileId },
            data: { visibleTo: status },
        });
        if (status === "PUBLIC") {
            return res.status(200).json({
                publicURL: `https://localhost:8000/files/public/${fileId}`,
                message: "File status updated successfully",
            });
        }
        return res.status(200).json({
            message: "File status updated successfully",
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Somethig failed" });
    }
});
exports.changeFileStatus = changeFileStatus;
