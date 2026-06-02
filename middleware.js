import NextAuth from 'next-auth';
import authConfig from './auth.config';

// Use the edge-safe config (no bcrypt/mongoose) for the middleware
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
