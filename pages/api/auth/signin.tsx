import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import validator from 'validator';
import bcrypt from 'bcrypt';
import * as jose from 'jose';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const errors: string[] = [];
      const { email, password } = req.body;
      const validationSchema = [
        {
          valid: validator.isEmail(email),
          errorMessage: 'Email is invalid',
        },
        {
          valid: validator.isLength(password, {
            min: 1,
          }),
          errorMessage: 'Password is invalid',
        },
      ];
      validationSchema.forEach((check) => {
        if (!check.valid) {
          return errors.push(check.errorMessage);
        }
        if (errors.length) {
          return res.status(400).json({ errorMessage: errors[0] });
        }
      });

      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        return res.status(401).json({ errorMessage: 'Email or password is invalid' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ errorMessage: 'Email or password is invalid' });
      }
      const alg = 'HS256';
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const token = await new jose.SignJWT({ email: user.email })
        .setProtectedHeader({ alg })
        .setExpirationTime('24h')
        .sign(secret);
      return res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        image: user.image,
        token,
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.status(405).json({ errorMessage: 'Method Not Allowed' });
  }
}
