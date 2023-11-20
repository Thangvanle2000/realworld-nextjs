import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const bearerToken = req.headers['authorization'] as string;
    const token = bearerToken.split(' ')[1];
    const payload = jwt.decode(token) as { email: string };

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
    }
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      image: user.image,
    });
  }
}
