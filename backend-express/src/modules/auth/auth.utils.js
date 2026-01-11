import bcrypt from "bcrypt";
import generateToken from '../../utils/generaetToken';

export const hashPassword = (password) => bcrypt.hash(password, 10);


export const token = (user) => ({
    ...generateToken(user),
    expires: 900,
})