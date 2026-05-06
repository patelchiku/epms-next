import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createMd5 } from "@/lib/server-utils";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" },
        ipAddress: { label: "IP", type: "text" },
      },
      async authorize(credentials) {
        const { mobile, password, ipAddress } = credentials as {
          mobile: string;
          password: string;
          ipAddress: string;
        };

        if (!mobile || !password) return null;

        const user = await prisma.user.findUnique({
          where: { mobile },
          include: { role: true },
        });

        if (!user || !user.isPresent) return null;

        // Support both MD5 (legacy) and bcrypt passwords
        const md5Hash = createMd5(password);
        const isMd5Match = user.password === md5Hash;
        const isBcryptMatch = user.password.startsWith("$2")
          ? await bcrypt.compare(password, user.password)
          : false;

        if (!isMd5Match && !isBcryptMatch) return null;

        // Admin (role 1) — direct login
        if (user.roleId === 1) {
          return {
            id: String(user.id),
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            mobile: user.mobile,
            roleId: user.roleId,
            roleName: user.role.name,
            profilePic: user.profilePic,
          };
        }

        // Non-admin — check IP approval
        if (ipAddress) {
          const approval = await prisma.userApproval.findFirst({
            where: { userId: user.id, ipAddress },
            orderBy: { id: "desc" },
          });

          if (!approval) {
            // Create pending approval request
            const now = new Date();
            await prisma.userApproval.create({
              data: {
                userId: user.id,
                ipAddress,
                date: now.toLocaleDateString("en-IN"),
                time: now.toLocaleTimeString("en-IN"),
                approved: 0,
              },
            });
            throw new Error("PENDING_APPROVAL");
          }

          if (approval.approved === 0) throw new Error("PENDING_APPROVAL");
          if (approval.approved === 2) throw new Error("REJECTED");
        }

        return {
          id: String(user.id),
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          mobile: user.mobile,
          roleId: user.roleId,
          roleName: user.role.name,
          profilePic: user.profilePic,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.mobile = (user as any).mobile;
        token.roleId = (user as any).roleId;
        token.roleName = (user as any).roleName;
        token.profilePic = (user as any).profilePic;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).mobile = token.mobile;
        (session.user as any).roleId = token.roleId;
        (session.user as any).roleName = token.roleName;
        (session.user as any).profilePic = token.profilePic;
      }
      return session;
    },
  },
});
