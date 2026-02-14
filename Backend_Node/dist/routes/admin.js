"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
router.get('/stats', adminController_1.statsHandler);
router.get('/rate-limit-status', adminController_1.rateLimitStatusHandler);
router.get('/receipts-per-minute', adminController_1.receiptsPerMinuteHandler);
// Metrics endpoints used by admin UI
router.get('/metrics/system', adminController_1.systemMetricsHandler);
router.get('/metrics/redis', adminController_1.redisMetricsHandler);
router.get('/metrics/kafka', adminController_1.kafkaMetricsHandler);
router.get('/metrics/top-latency', adminController_1.topLatencyHandler);
router.get('/metrics/top-count', adminController_1.topCountHandler);
router.get('/receipts', adminController_1.receiptsHandler);
exports.default = router;
