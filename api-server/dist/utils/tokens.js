"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = ({ id, username, email, }) => {
    return jsonwebtoken_1.default.sign({ id, username, email }, process.env.JWT_SECRET || "", {
        expiresIn: "7d",
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    const user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "");
    return user || null;
};
exports.verifyToken = verifyToken;
