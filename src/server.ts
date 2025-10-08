import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables first
dotenv.config();

// Import database configuration
import sequelize from '@/config/database';

// Import models after database initialization
import '@/models';

// Import routes and middleware
import routes from '@/routes';
import { errorHandler, notFoundHandler } from '@/middlewares/error';
import imageOptimizeMiddleware from '@/middlewares/imageOptimizer';
import { requestLogger, errorLogger, performanceMonitor } from '@/middlewares/logger';
import { ENV, Logger } from '@/lib';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ENV.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000'],
    credentials: true,
  },
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: ENV.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging and monitoring middleware
app.use(morgan('combined'));
app.use(requestLogger);
app.use(performanceMonitor);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());



// Static files
app.use('/uploads', express.static('uploads'));

// Image optimization middleware (before routes to catch all responses)
app.use(imageOptimizeMiddleware);

// API Routes with caching
app.use(`${ENV.API_PREFIX}${ENV.API_VERSION}`, routes);

// Socket.IO connection handler
io.on('connection', (socket) => {
  Logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    Logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    Logger.info('✅ Database connection established successfully.');

    // Sync database (in development)
    // if (process.env['NODE_ENV'] === 'development') {
    //   await sequelize.sync({ alter: true });
    //   Logger.info('✅ Database synchronized.');
    // }

    const PORT = ENV.PORT || 8000;
    const HOST = ENV.HOST || 'localhost';

    server.listen(PORT, () => {
      Logger.info(`🚀 Server is running on http://${HOST}:${PORT}`);
      Logger.info(`📚 API Documentation: http://${HOST}:${PORT}${ENV.API_PREFIX}${ENV.API_VERSION}/health`);
      Logger.info(`🌍 Environment: ${ENV.NODE_ENV || 'development'}`);
      Logger.info(`🔒 Security: Helmet, CORS enabled`);
      Logger.info(`⚡ Performance: Monitoring enabled`);
    });
  } catch (error) {
    Logger.error(`❌ Failed to start server: ${error}`);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  Logger.info(`${signal} received, shutting down gracefully`);
  
  try {
    // Close database connection
    await sequelize.close();
    Logger.info('✅ Database connection closed');
    
    // Close server
    server.close(() => {
      Logger.info('✅ Server closed');
      process.exit(0);
    });
    
    // Force exit after 10 seconds
    setTimeout(() => {
      Logger.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } catch (error) {
    Logger.error(`❌ Error during shutdown: ${error}`);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  Logger.error(`❌ Uncaught Exception: ${error}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error(`❌ Unhandled Rejection at: ${promise} Reason: ${reason}`);
  process.exit(1);
});

// Start server
startServer();

export { app, server, io }; 