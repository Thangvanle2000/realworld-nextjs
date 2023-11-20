import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const bearerToken = req.headers['authorization'] as string;
  const token = bearerToken.split(' ')[1];
  const payload = jwt.decode(token) as { email: string };
  const id: any = req.query.id;
  const user: any = await prisma.user.findUnique({
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
    if (req.method === 'DELETE') {
      await prisma.comment.delete({
        where: {
          id: +id,
        },
      });
      return res.status(200).json({
        status: 'success',
      });
    }
  }
}
