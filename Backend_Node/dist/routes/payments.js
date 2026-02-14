"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentsController_1 = require("../controllers/paymentsController");
const router = (0, express_1.Router)();
router.post('/', paymentsController_1.createPaymentHandler);
router.get('/:id', paymentsController_1.getPaymentHandler);
exports.default = router;
