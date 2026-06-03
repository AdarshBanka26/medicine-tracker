// Edge-runtime-safe config — no Node.js-only imports (no bcrypt, no mongoose).
// Used by middleware. The full auth.js adds the Credentials provider on top of this.
const authConfig = {
  providers: [],

  pages: {
    signIn: '/auth/login',
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Always pass through: NextAuth's own endpoints and static assets
      if (
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/icons') ||
        pathname.includes('favicon') ||
        pathname === '/manifest.json' ||
        pathname === '/sw.js'
      ) {
        return true;
      }

      // Landing page "/" — always public; redirect logged-in users to dashboard
      if (pathname === '/') {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      // Auth pages — let guests through; redirect logged-in users to dashboard
      if (pathname.startsWith('/auth')) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      // All other routes require authentication
      if (!isLoggedIn) {
        const loginUrl = new URL('/auth/login', nextUrl);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
  },

  session: { strategy: 'jwt' },
};

export default authConfig;
