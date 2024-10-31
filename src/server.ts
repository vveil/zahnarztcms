import express from "express";
import payload from "payload";
import cors from "cors";
import { Pool } from '@payloadcms/db-postgres';
require("dotenv").config();

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: ["https://zahnarzt.niklas.ai", "http://localhost:3000", "http://localhost:3010", "https://dr-werner-zahnarzt.de"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600 // Cache preflight requests for 10 minutes
};

app.use(cors(corsOptions));

// Add security headers
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });
  next();
});

// Enhanced error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  payload.logger.error(err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Health check endpoint
app.get('/api/_health', async (_, res) => {
  try {
    // Check if payload is initialized
    if (!payload.initialized) {
      throw new Error('Payload not initialized');
    }
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Redirect root to Admin panel
app.get("/", (_, res) => {
  res.redirect("/admin");
});

const start = async () => {
  try {
    // Initialize Payload with enhanced options
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      express: app,
      onInit: async () => {
        payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
      },
      // Add rate limiting
      rateLimit: {
        trustProxy: true,
        window: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per window
      },
      // Configure file upload limits
      upload: {
        limits: {
          fileSize: 5000000, // 5MB
        },
      }
    });

    // Graceful shutdown handler
    const gracefulShutdown = async () => {
      console.log('Received shutdown signal');

      try {
        // Allow ongoing requests to complete (30 second timeout)
        const server = app.listen();
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });

        // Force close after timeout
        setTimeout(() => {
          console.log('Forcing shutdown');
          process.exit(1);
        }, 30000);

      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    };

    // Register shutdown handlers
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    const PORT = process.env.PORT || 3010;
    app.listen(PORT, () => {
      payload.logger.info(`Server started on port ${PORT}`);
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  payload.logger.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  payload.logger.error(reason);
});

start();
