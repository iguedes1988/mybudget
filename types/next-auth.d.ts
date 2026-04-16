import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      teamId?: string;
      accountType?: string;
      isEmailVerified: boolean;
    };
  }

  interface User extends DefaultUser {
    role?: string;
    teamId?: string;
    accountType?: string;
    isEmailVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    teamId?: string;
    accountType?: string;
    isEmailVerified?: boolean;
  }
}
