import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import authConfig from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};
        if (!email || !password) return null;

        await dbConnect();
        const user = await User.findOne({ email: email.toLowerCase() }).lean();
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      return session;
    },
  },
});
