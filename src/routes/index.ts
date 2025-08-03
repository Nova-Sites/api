import { Router, Request, Response } from 'express';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import { ROUTES } from '@/constants';

const router = Router();

// Health check route
router.get(ROUTES.HEALTH, (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use(ROUTES.CATEGORIES, categoryRoutes);
router.use(ROUTES.PRODUCTS, productRoutes);

export default router; 