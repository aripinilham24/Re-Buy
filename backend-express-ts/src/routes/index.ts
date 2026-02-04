import {Router} from 'express';
import type {Request, Response} from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'API is working',
        data: null
    })
});

export default router;