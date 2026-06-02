// Edge-runtime-safe config — no Node.js-only imports (no bcrypt, no mongoose).
// Used by middleware. The full auth.js adds the Credentials provider on top of this.
const authConfig = {
  providers: [], // providers that require Node.js are added in auth.js only

  pages: {
    signIn: '/auth/login',
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Always allow static assets and NextAuth's own API
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

      // Auth pages: let unauthenticated users through; redirect logged-in users home
      if (pathname.startsWith('/auth')) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      // Everything else requires login
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
