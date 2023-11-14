import { NextApiRequest, NextApiResponse } from 'next';
import * as jose from 'jose';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
export default async function middleware(req: NextApiRequest, res: NextApiResponse) {
  const headersInstance = headers();
  const bearerToken = headersInstance.get('authorization') as string;

  if (!bearerToken) {
    return new NextResponse(JSON.stringify({ errorMessage: 'Unauthorized request 1' }), { status: 401 });
  }
  const token = bearerToken.split(' ')[1];
  if (!token) {
    return new NextResponse(JSON.stringify({ errorMessage: 'Unauthorized request 2' }), { status: 401 });
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  try {
    await jose.jwtVerify(token, secret);
  } catch (error) {
    return new NextResponse(JSON.stringify({ errorMessage: 'Unauthorized request3' }), { status: 401 });
  }
}
export const config = {
  //   matcher: ['/api/auth/profile'],
};
