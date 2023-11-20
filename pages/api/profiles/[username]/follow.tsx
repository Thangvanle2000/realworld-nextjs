import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token: any = req.headers?.authorization?.split(' ')[1];
  const payload = jwt.decode(token) as { email: string };
  const username: any = req.query.username;

  const user = await prisma.user.findUnique({
    where: {
      email: payload?.email,
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
    const userId: any = await prisma.user.findMany({
      where: {
        username: {
          equals: username,
        },
      },
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
        follows: {},
      },
    });

    if (req.method === 'POST') {
      await prisma.follow_User.create({
        data: {
          following: true,
          user_id: user?.id,
          user_followed: userId.id ? userId.id : userId[0]?.id,
        },
      });

      return res.status(200).json({
        status: 'success',
        userId,
      });
    }
    if (req.method === 'DELETE') {
      await prisma.follow_User.deleteMany({
        where: {
          user_followed: userId?.id,
        },
      });
      return res.status(200).json({
        status: 'Delete Success',
        userId,
      });
    }
    return res.status(200).json({
      status: 'Delete Success',
      userId,
    });
  }
}
