import express from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import config from '../config';
import logger from '../utils/logger';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

const matchingServiceProxy = createProxyMiddleware({
  target: config.services.matching, // Matching Service URL
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying
  pathRewrite: {
    '^/(.*)': '/$1', // front end connects to matching service via /ws only
  },
  on: {
    proxyReq: fixRequestBody,
  },
});

// Apply the proxy middleware to all HTTP routes under /api/matching
router.use('/matching', matchingServiceProxy);

export { matchingServiceProxy };
export default router;
