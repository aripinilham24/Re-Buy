import UserModel from '../../models/user/user.model.js';
import bcrypt from 'bcrypt';
import type { FormRegister, FormLogin } from '../../types/formAuth.types.js';
import { validateRegister, validateLogin } from './auth.validations.js';
import createJwt from '../../utils/jwt.utils.js';

const register = async (data:FormRegister) => {
  validateRegister(data);
  const {username, email, password} = data;
  const existingUser = await UserModel.findOne({email});
  if(existingUser) throw {
    success: false,
    message: 'Email already in use',
    error: 'RegistrationError'
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    username,
    email,
    password: hashedPassword
  })

  const tokens = createJwt(user);

  return {
    success: true,
    message: 'User registered successfully',
    data: {
      userId: user._id,
      name: user.username,
      email: user.email,
      profile: user.avatar,
      
    },
    tokens
  }

}

const login = async (data:FormLogin) => {
  validateLogin(data);
  const {email, password} = data;

  const user = await UserModel.findOne({email}).select('+password');
  if(!user) throw {
    success: false,
    message: 'Invalid email or password',
    error: 'LoginError'
  }

  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if(!isPasswordValid) throw {
    success: false,
    message: 'Invalid email or password',
    error: 'LoginError'
  }

  const tokens = createJwt(user);

  return {
    success: true,
    message: 'User logged in successfully',
    data: {
      userId: user._id,
      name: user.username,
      email: user.email,
      profile: user.avatar,
      
    },
    tokens
  }
}


export default {register, login};
