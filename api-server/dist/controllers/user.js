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
exports.changeFileStatus = exports.uploadfile = exports.loginUser = exports.registerUser = void 0;
const client_1 = require("../client");
const tokens_1 = require("../utils/tokens");
const hashpasswords_1 = require("../utils/hashpasswords");
const stream_1 = __importDefault(require("stream"));
const aws_1 = require("../utils/aws");
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate req.body
        if (!req.body) {
            res.status(400).json({ message: "Request body is missing." });
            return;
        }
        const { username, email, password } = req.body;
        if (!username)
            throw new Error("Enter username");
        if (!email)
            throw new Error("Enter email");
        if (!password)
            throw new Error("Enter password");
        //check if the user already exists
        const isUserExists = yield client_1.client.user.findFirst({
            where: { email: email },
        });
        if (isUserExists) {
            throw new Error("User already exists");
        }
        // hash password
        const hashedPassword = (0, hashpasswords_1.hashPassword)(password);
        //create user
        const user = yield client_1.client.user.create({
            data: { username, email, password: hashedPassword },
        });
        //create tokens
        const token = (0, tokens_1.generateToken)({
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
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate req.body
    try {
        if (!req.body) {
            res.status(400).json({ message: "Request body is missing." });
            return;
        }
        const { email, password } = req.body;
        if (!email)
            throw new Error("Enter email");
        if (!password)
            throw new Error("Enter password");
        //check if the user already exists
        const isUserExists = yield client_1.client.user.findFirst({
            where: { email: email },
        });
        if (!isUserExists) {
            throw new Error("User does not exist. Please register");
        }
        if (!(0, hashpasswords_1.isPasswordEqual)(password, isUserExists.password)) {
            throw new Error("Invalid password");
        }
        //create tokens
        const token = (0, tokens_1.generateToken)({
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
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.loginUser = loginUser;
const uploadfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const passThroughStream = new stream_1.default.PassThrough();
        const key = `${user.id}/${file.originalname}- ${Date.now()}`;
        const response = yield (0, aws_1.uploadfiletos3)(passThroughStream, key, file.mimetype);
        passThroughStream.end(file.buffer);
        const userUploadedFile = yield client_1.client.file.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Somethig failed" });
    }
});
exports.uploadfile = uploadfile;
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
        return res
            .status(200)
            .json({ message: "File status updated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Somethig failed" });
    }
});
exports.changeFileStatus = changeFileStatus;
