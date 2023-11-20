import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { convertSlug } from '../articles';

const prisma = new PrismaClient();
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const param: any = req.query;
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
    if (req.method === 'DELETE') {
      try {
        await prisma.article.delete({
          where: { slug: param.slug },
        });
        res.status(200).json({
          status: 'success',
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
    if (req.method === 'PUT') {
      const { title, description, body } = req.body;
      try {
        await prisma.article.update({
          where: { slug: param.slug },
          data: {
            title: title,
            description: description,
            body: body,
            slug: convertSlug(title),
          },
        });
        res.status(200).json({
          status: 'success',
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}
