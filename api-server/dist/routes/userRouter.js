"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const user_1 = require("../controllers/user");
const authentication_1 = require("../middleware/authentication");
const upload = (0, multer_1.default)();
exports.userRouter = (0, express_1.Router)();
exports.userRouter.post("/register", user_1.registerUser);
exports.userRouter.post("/login", user_1.loginUser);
exports.userRouter.post("/uploads", authentication_1.authenticateJwt, upload.single("file"), user_1.uploadfile);
exports.userRouter.post("/change-status", authentication_1.authenticateJwt, user_1.changeFileStatus);
