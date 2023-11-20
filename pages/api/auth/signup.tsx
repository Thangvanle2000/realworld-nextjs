import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import validator from 'validator';
import bcrypt from 'bcrypt';
import * as jose from 'jose';
const prisma = new PrismaClient();

interface User {
  email: string;
  password: string;
  username: string;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password, username }: User = req.body;
    const errors: string[] = [];
    const validationSchema = [
      {
        valid: validator.isLength(username, {
          min: 1,
          max: 20,
        }),
        errorMessage: 'username is not enough length',
      },
      {
        valid: validator.isLength(username, {
          min: 1,
          max: 20,
        }),
        errorMessage: 'username is not enough length',
      },
      {
        valid: validator.isEmail(email),
        errorMessage: 'Email is Invalid',
      },
      {
        valid: validator.isStrongPassword(password, {}),
        errorMessage: 'Password is not strong enought',
      },
    ];

    validationSchema.forEach((check) => {
      if (!check.valid) {
        errors.push(check.errorMessage);
      }
    });
    if (errors.length) {
      return res.status(400).json({ errorMessage: errors[0] });
    }

    const userAlreadySignIn = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userAlreadySignIn) {
      return res.status(400).json({ errorMessage: 'Email already sign in' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username,
        email,
        password: hashedPassword,
      },
    });
    const alg = 'HS256';
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({ email: user.email })
      .setProtectedHeader({ alg })
      .setExpirationTime('24h')
      .sign(secret);
    return res.status(200).json({
      token,
    });
  }
}
