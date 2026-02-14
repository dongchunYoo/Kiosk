import { Router } from 'express';
import {
	statsHandler,
	systemMetricsHandler,
	redisMetricsHandler,
	kafkaMetricsHandler,
	topLatencyHandler,
	topCountHandler,
	receiptsHandler,
	rateLimitStatusHandler,
	receiptsPerMinuteHandler,
} from '../controllers/adminController';

const router = Router();

router.get('/stats', statsHandler);
router.get('/rate-limit-status', rateLimitStatusHandler);
router.get('/receipts-per-minute', receiptsPerMinuteHandler);

// Metrics endpoints used by admin UI
router.get('/metrics/system', systemMetricsHandler);
router.get('/metrics/redis', redisMetricsHandler);
router.get('/metrics/kafka', kafkaMetricsHandler);
router.get('/metrics/top-latency', topLatencyHandler);
router.get('/metrics/top-count', topCountHandler);
router.get('/receipts', receiptsHandler);

export default router;
