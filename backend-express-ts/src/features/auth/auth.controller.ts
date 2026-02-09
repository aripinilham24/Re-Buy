import type { Request, Response } from 'express';
import services from './auth.services.js';

const register =  async (req:Request, res: Response) => {
    try {
        const result = await services.register(req.body);
        res.status(200).json(result);
    } catch (e: unknown) {
        res.status(400).json({
            success: false,
            message: 'Registration failed',
            error: (e as Error).message
        })
    }
}


const login =  async (req:Request, res: Response) => {
    try {
        const result = await services.login(req.body);
        res.status(200).json(result);
    } catch (e: unknown) {
        res.status(400).json({
            success: false,
            message: 'Login failed',
            error: (e as Error).message
        })
    }
}

export default {
    register,
    login
}