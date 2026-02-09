import {Types} from 'mongoose';

export type userRole = 'user' | 'admin';
export type authProvider = 'local' | 'google';

export default interface user {
    _id?: Types.ObjectId | string;
    username: string;
    email: string;
    password?: string;
    avatar?: string | null;
    role?: userRole;
    provider?: authProvider;
    providerId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}