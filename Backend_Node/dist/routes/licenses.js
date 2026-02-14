"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const licensesController_1 = require("../controllers/licensesController");
const router = (0, express_1.Router)();
router.get('/', licensesController_1.listHandler);
router.post('/', licensesController_1.createHandler);
router.post('/check-key', licensesController_1.checkKeyHandler);
exports.default = router;
