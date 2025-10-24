import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import usersRouter from './routes/users';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import reviewsRouter from './routes/reviews';
import recommendationsRouter from './routes/recommendations';
import trusttokenRouter from './routes/trusttoken';
import reputationcardsRouter from './routes/reputationcards';

// Import utilities
import { checkProgramsOnStartup } from './utils/programVerification';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/trusttoken', trusttokenRouter);
app.use('/api/reputationcards', reputationcardsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Solana Network: ${process.env.SOLANA_NETWORK || 'devnet'}`);
  console.log('');
  
  // Check Solana programs on startup
  await checkProgramsOnStartup();
});

export default app;
