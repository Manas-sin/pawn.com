// filepath: c:\Users\Admin\Downloads\MERN-Pract\chessproject\chessproj\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/signin/signin', req.url));
  }
  return NextResponse.next();
}