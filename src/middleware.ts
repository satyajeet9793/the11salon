import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "supersecret1234567890" });
  const isAuthPage = req.nextUrl.pathname.startsWith('/admin/login');

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return null;
  }

  if (!token) {
    // TEMPORARY BYPASS: Allow access without logging in
    // let from = req.nextUrl.pathname;
    // if (req.nextUrl.search) {
    //   from += req.nextUrl.search;
    // }
    // return NextResponse.redirect(
    //   new URL(`/admin/login?from=${encodeURIComponent(from)}`, req.url)
    // );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
