import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Replace with your own validation logic
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", name: "Admin" }; // Ensure `id` is a string
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/signin",
  },
  useSecureCookies: false, // For development on HTTP
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    redirect({ url, baseUrl }) {
      const currentBaseUrl = process.env.NEXTAUTH_URL || baseUrl;
      return url.startsWith(currentBaseUrl) ? url : currentBaseUrl;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
