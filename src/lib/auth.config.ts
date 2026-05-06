import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login");
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

      if (isApiAuth) return true;
      if (isLoggedIn && isAuthPage) return Response.redirect(new URL("/dashboard", nextUrl));
      if (!isLoggedIn && !isAuthPage) return Response.redirect(new URL("/login", nextUrl));
      return true;
    },
  },
};
