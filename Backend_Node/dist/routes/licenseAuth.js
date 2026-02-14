"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const licenseAuthController_1 = require("../controllers/licenseAuthController");
const router = express_1.default.Router();
router.post('/login', licenseAuthController_1.loginHandler);
exports.default = router;
