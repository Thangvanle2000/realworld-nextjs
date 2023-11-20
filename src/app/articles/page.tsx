import { PrismaClient } from '@prisma/client';

interface searchParamsTypes {
  tag: string;
  author: string;
  favorited: string;
}
const prisma = new PrismaClient();

async function getArticles(tag: string | undefined, author: string | undefined, favorited: string | undefined) {
  const where: any = {};
  const select = {
    slug: true,
    title: true,
    description: true,
    body: true,
    // tagList: true,
    created_at: true,
    updated_at: true,
    favorited: true,
    author: true,
  };
  if (tag) {
    const tags = {
      equals: tag,
    };
    where.tag = tags;
  }
  if (author) {
    const authors = {
      equals: author,
    };
    where.author = authors;
  }
  if (favorited) {
    const favoriteds = {
      favorite: {
        equals: favorited,
      },
    };
    where.favorited = favoriteds;
  }
  return prisma.article.findMany({ where, select });
}

async function ArticlesPage({ searchParams }: any) {
  const getArticlesById = await getArticles(searchParams.tag, searchParams.author, searchParams.favorited);
  return <></>;
}

export default ArticlesPage;
