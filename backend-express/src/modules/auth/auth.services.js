import userModel from '../user/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import generateToken from '../../utils/generaetToken';

dotenv.config();

const {acessToken, refreshToken} = generateToken(data);

const register = (data) => {
  return;
};

const login = (data) => {
  return;
};

export default services;
