import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const bearerToken = req.headers['authorization'] as string;
  const token = bearerToken.split(' ')[1];
  const payload = jwt.decode(token) as { email: string };
  const slug: any = req.query.slug;

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
    const article: any = await prisma.article.findMany({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        body: true,
        created_at: true,
        updated_at: true,
        favorited: true,
        user: true,
      },
    });
    if (req.method === 'POST') {
      await prisma.follow_Article.create({
        data: {
          following: true,
          articles: {
            connect: {
              id: article[0]?.id,
            },
          },
          articles_id: article[0]?.id,
          users: {
            connect: {
              id: user?.id,
            },
          },
        },
      });
      res.status(200).json({
        status: 'success',
        article,
      });
    }
    if (req.method === 'DELETE') {
      await prisma.follow_Article.deleteMany({
        where: {
          articles_id: article[0]?.id,
          user_id: user?.id,
        },
      });
      return res.status(200).json({
        status: 'Delete Success',
      });
    }
    return res.status(200).json({
      status: 'Delete Success',
    });
  }
}
