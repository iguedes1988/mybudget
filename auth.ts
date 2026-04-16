import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.password) return null;
        if (user.suspended) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          teamId: user.teamId ?? undefined,
          accountType: user.accountType,
          isEmailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.teamId = (user as { teamId?: string }).teamId;
        token.accountType = (user as { accountType?: string }).accountType;
        token.isEmailVerified = (user as { isEmailVerified?: boolean }).isEmailVerified ?? false;
      }
      // Refresh from DB on every session update (after invite accept or email verification)
      if (trigger === "update" && token.id) {
        const freshUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { teamId: true, accountType: true, role: true, emailVerified: true },
        });
        if (freshUser) {
          token.teamId = freshUser.teamId ?? undefined;
          token.accountType = freshUser.accountType;
          token.role = freshUser.role;
          token.isEmailVerified = freshUser.emailVerified;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.teamId = token.teamId as string | undefined;
        session.user.accountType = token.accountType as string | undefined;
        session.user.isEmailVerified = token.isEmailVerified as boolean ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});
