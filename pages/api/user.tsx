import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import bcrypt from 'bcrypt';
import * as jose from 'jose';
import { PrismaClient, Prisma, User } from '@prisma/client';
const prisma = new PrismaClient();
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const bearerToken = req.headers['authorization'] as string;
  const token = bearerToken.split(' ')[1];

  const payload = jwt.decode(token) as { email: string };
  if (req.method === 'PUT') {
    const { email, bio, username, image }: User = req.body;

    let userNew: any;
    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        image: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        errorMessage: 'User not found',
      });
    } else {
      userNew = {
        email: email,
        username: username,
        bio: bio,
        image: image,
      };
    }

    const userUpdate = await prisma.user.update({
      where: {
        email: payload.email,
      },
      data: userNew,
    });
    if (userUpdate) {
      return res.status(200).json({
        message: 'Update success',
      });
    } else {
      return res.status(400).json({
        message: 'Update fail',
      });
    }
  }
}
