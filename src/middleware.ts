import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const protectedPaths = ['/admin', '/dashboard'];
  const isPathProtected = protectedPaths?.some((path) =>
    pathname.includes(path)
  );
  const res = NextResponse.next();
  if (isPathProtected) {
    const token = await getToken({ req });
    console.log(token);
    if (!token) {
      const url = new URL(`/sign-in`, req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  return res;
}