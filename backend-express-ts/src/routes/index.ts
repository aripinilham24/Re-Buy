import {Router} from 'express';
import type {Request, Response} from 'express';
import AuthRoutes from '../features/auth/auth.routes.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'API is working',
        data: null
    })
});

router.use('/auth', AuthRoutes);

export default router;