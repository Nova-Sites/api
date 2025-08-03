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
import { requestLogger, errorLogger, performanceMonitor } from '@/middlewares/logger';
import { ROUTES } from '@/constants';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:8000'],
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
  origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:8000'],
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

// API Routes with caching
app.use(`${ROUTES.API_PREFIX}${ROUTES.VERSION}`, routes);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
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
    console.log('✅ Database connection established successfully.');

    // Sync database (in development)
    // if (process.env['NODE_ENV'] === 'development') {
    //   await sequelize.sync({ alter: true });
    //   console.log('✅ Database synchronized.');
    // }

    const PORT = process.env['PORT'] || 8000;
    const HOST = process.env['HOST'] || 'localhost';

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
      console.log(`📚 API Documentation: http://${HOST}:${PORT}${ROUTES.API_PREFIX}${ROUTES.VERSION}/health`);
      console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
      console.log(`🔒 Security: Helmet, CORS enabled`);
      console.log(`⚡ Performance: Monitoring enabled`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down gracefully`);
  
  try {
    // Close database connection
    await sequelize.close();
    console.log('✅ Database connection closed');
    
    // Close server
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
    
    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
startServer();

export { app, server, io }; 