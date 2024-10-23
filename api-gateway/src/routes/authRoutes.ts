import express from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import config from '../config';
import logger from '../utils/logger';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

const authServiceProxy = createProxyMiddleware({
  target: config.services.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/(.*)': '/api/v1/auth/$1', // Maps /login -> /api/v1/auth/login
  },
  on: {
    proxyReq: fixRequestBody, // need to fix the request body before forwarding
  },
});

// Log incoming requests to the Auth route
// router.use((req, res, next) => {
//   logger.info(
//     `Auth route accessed: ${req.method} ${req.originalUrl} ${req.path}`,
//   );
//   next();
// });

// Apply the proxy middleware to all routes handled by authRoutes
router.use('/', authServiceProxy);

export default router;
