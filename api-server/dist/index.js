"use strict";
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
const app = (0, express_1.default)();
app.use((0, express_status_monitor_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/users", userRouter_1.userRouter);
app.use("/files", fileRouter_1.fileRouter);
app.listen(3000);
