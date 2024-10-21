import express from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import config from '../config';
import logger from '../utils/logger';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

const usersServiceProxy = createProxyMiddleware({
  target: config.services.auth, // same endpoint / microservice as auth
  changeOrigin: true,
  pathRewrite: {
    '^/(.*)': '/api/v1/users/$1',
  },
  on: {
    proxyReq: fixRequestBody,
  },
});

// Log incoming requests to the Users route
// router.use((req, res, next) => {
//   logger.info(
//     `Users route accessed: ${req.method} ${req.originalUrl} ${req.path}`,
//   );
//   next();
// });

// Apply the proxy middleware to all routes handled by usersRoute
router.use('/', usersServiceProxy);

export default router;
