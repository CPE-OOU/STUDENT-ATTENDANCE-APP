import { NextApiRequest } from 'next';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export const runtime = 'nodejs';

export async function middleware(req: NextApiRequest) {
  const pathname = new URL(req.url!).pathname;
  const protectedPaths = ['/admin', '/dashboard'];
  const isPathProtected = protectedPaths?.some((path) =>
    pathname.includes(path)
  );
  const res = NextResponse.next();
  if (isPathProtected) {
    const token = await getToken({ req });
    if (!token) {
      const url = new URL(`/sign-in`, req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  return res;
}
