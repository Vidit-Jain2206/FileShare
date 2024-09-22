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
exports.authenticateJwt = void 0;
const tokens_1 = require("../utils/tokens");
const authenticateJwt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies["access_token"];
        if (!token) {
            throw new Error("Not Authenticated. Please Login");
        }
        const user = (0, tokens_1.verifyToken)(token);
        if (!user) {
            throw new Error("Not Authenticated. Please Login");
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
});
exports.authenticateJwt = authenticateJwt;
