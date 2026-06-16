import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): express.Application {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(healthRouter);
  // Register routes from docs/SERVICE_NAME/api.yaml
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
