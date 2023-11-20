import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const bearerToken = req.headers['authorization'] as string;
  const token = bearerToken.split(' ')[1];
  const payload = jwt.decode(token) as { email: string };
  const { body }: any = req.body;
  const slug: any = req.query.slug;
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
  const articleId: any = await prisma.article.findUnique({
    where: {
      slug: slug,
    },
    select: {
      id: true,
    },
  });
  if (!user) {
    return res.status(401).json({
      errorMessage: 'User not found',
    });
  } else {
    if (req.method === 'POST') {
      const commentCount = await prisma.article.findMany({
        where: {
          id: articleId.id,
        },
        select: {
          _count: {
            select: { comments: true },
          },
        },
      });

      const comment = await prisma.comment.create({
        data: {
          content: body,
          comment_count: commentCount[0]._count.comments + 1,
          favorite: false,
          favorite_count: 1,
          user: {
            connect: {
              id: user.id,
            },
          },
          article: {
            connect: {
              id: articleId.id,
            },
          },
        },
      });
      res.status(200).json({
        status: 'success',
        comment,
      });
    }
    if (req.method === 'GET') {
      const multiComment = await prisma.comment.findMany({
        where: {
          article_id: articleId.id,
        },
        select: {
          id: true,
          content: true,
          user: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!multiComment) {
        return res.status(200).json({
          status: 'fail',
          message: 'not comment in article',
        });
      } else {
        return res.status(200).json({
          status: 'success',
          multiComment,
        });
      }
    }
  }
}
