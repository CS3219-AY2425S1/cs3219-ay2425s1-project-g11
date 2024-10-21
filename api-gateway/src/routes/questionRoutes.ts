import express, { Request, Response } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import config from '../config';
import { authMiddleware } from '../middleware/authMiddleware';
import logger from '../utils/logger';

const router = express.Router();

const questionServiceProxy = createProxyMiddleware({
  target: config.services.question,
  changeOrigin: true,
  /**
   * For Path Rewrite, for example client side api call is /api/questions/tags
   * -> Reaches here (questionRouter) as /tags -> gets dynamically rerouted to question service
   */
  pathRewrite: {
    '^/(.*)': '/api/v1/questions/$1', // Dynamic path rewriting, e.g., /tags -> /api/v1/questions/tags
  },
  on: {
    proxyReq: fixRequestBody, // need to fix the request body before forwarding
  },
});

// router.use((req, res, next) => {
//   logger.info(`Question route accessed with remaining path: ${req.url}`);
//   next();
// });

// Uncomment and apply the authentication middleware if needed
// router.use(authMiddleware);

// Apply the proxy middleware to all routes handled by questionRoutes
router.use('/', questionServiceProxy);

export default router;
