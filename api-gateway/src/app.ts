import express from 'express';
import cors from 'cors';
import routes from './routes';
import { matchingServiceProxy } from './routes/matchingRoutes';
import { errorHandler } from './middleware/errorHandler';
import config from './config';
import logger from './utils/logger';
import http from 'http';
import { Socket } from 'net';

const app = express();

// Middleware
app.use(cors(config.corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Handle WebSocket Upgrade
server.on('upgrade', (req, socket, head) => {
  const { url } = req;
  if (url && url.startsWith('/api/matching/ws')) {
    logger.info(`WebSocket upgrade request for: ${url}`);
    matchingServiceProxy.upgrade(req, socket as Socket, head);
  } else {
    socket.destroy();
  }
});

// Start server
const startServer = () => {
  server.listen(config.port, () => {
    logger.info(`API Gateway running on port ${config.port}`);
  });
};

if (require.main === module) {
  startServer();
}

export default app;
