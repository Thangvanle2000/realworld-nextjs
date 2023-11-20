import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
export const convertSlug = (title: string) => {
  if (title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  return '';
};
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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
    } else {
      const { title, description, body, tagList } = req.body;

      const articleUnique = await prisma.article.findUnique({
        where: {
          slug: convertSlug(title),
        },
      });

      if (!title || !description || !body || !tagList) {
        return res.status(403).json({
          status: ' ',
        });
      } else {
        if (!articleUnique) {
          const article = await prisma.article.create({
            data: {
              title: title,
              tag: tagList,
              body: body,
              description: description,
              slug: convertSlug(title),
              user_id: user.id,
              author: user.username,
              favorited: false,
              status_post: 'DISLIKE',
              user: undefined,
              comments: {},
              follows: undefined,
            },
          });
          return res.status(200).json({
            status: 'Success',
            article,
          });
        } else {
          return res.status(401).json({
            status: 'Slug article invalid',
          });
        }
      }
    }
  }
  if (req.method === 'GET') {
    const param = req.query;

    const where: any = {};

    const select = {
      slug: true,
      title: true,
      description: true,
      body: true,
      created_at: true,
      updated_at: true,
      favorited: true,
      author: true,
      tag: true,
    };

    if (param.tag) {
      const tags = {
        has: param.tag,
      };
      where.tag = tags;
    }

    if (param.author) {
      const author = {
        equals: param.author,
      };

      where.author = author;
    }

    if (param.favorited) {
      const favoriteds = {
        favorited: {
          equals: param.favorited,
        },
      };
      where.favorited = favoriteds;
    }

    const articles = await prisma.article.findMany({ where, select });
    if (param.limit) {
      const limit = await prisma.article.findMany({
        skip: 10,
        take: 1,
      });
      return limit;
    }
    return res.status(200).json({
      status: 'success',
      articles,
    });
  }
}
