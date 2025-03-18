import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../model/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        await connectDB();
        const user = await User.findOne({ email: credentials?.email });
        if (user && bcrypt.compareSync(credentials?.password, user.password)) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image || "https://via.placeholder.com/50",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      await connectDB();
      const existingUser = await User.findOne({ email: user.email });
      let isNewUser = false;

      if (!existingUser) {
        const newUser = await User.create({
          name: user.name,
          email: user.email,
          image: user.image || profile?.picture || null,
          password: account?.provider === "credentials" ? user.password : undefined,
        });
        user.id = newUser._id.toString();
        isNewUser = true;
      } else {
        user.id = existingUser._id.toString();
        user.image = existingUser.image || user.image;
      }

      user.isNewUser = isNewUser;
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.isNewUser = user.isNewUser || false;
      }
      return token;
    },
    async session({ session, token }: any) {
      console.log("🟢 Session Callback - Token:", token);
      if (!token) {
        console.error("🔴 Token is missing in session callback!");
        return null;
      }

      session.user = {
        id: token.id || token.sub,
        name: token.name,
        email: token.email,
        image: token.picture || null,
      };
      session.isNewUser = token.isNewUser ?? false;

      console.log("🟢 Returning session:", session);
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    signOut: "/signin",
    error: "/signin",
    verifyRequest: "/signin",
    newUser: "/welcome",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);