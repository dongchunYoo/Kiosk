"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appdataController_1 = require("../controllers/appdataController");
const router = (0, express_1.Router)();
router.get('/', appdataController_1.getAppDataHandler);
exports.default = router;
