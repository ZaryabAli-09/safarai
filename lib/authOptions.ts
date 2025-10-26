import { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "./db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.OAUTH_CLIENT_ID!,
      clientSecret: process.env.OAUTH_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        try {
          await dbConnect();

          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            throw new Error("Please verify you account first");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }
          return {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.username,
          };
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          const randomPassword = crypto.randomBytes(16).toString("hex");
          dbUser = await new User({
            email: user.email,
            username: user.name,
            password: randomPassword,
            isVerified: true,
            role: "user",
          }).save();
        }

        user._id = dbUser._id.toString();
        user.role = dbUser.role;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/app/trips`;
    },

    // NextAuth stores that user info in a JWT token (JSON Web Token).
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id; // Ensure id is a string
        token.role = user.role;
      }

      return token;
    },

    // That token’s info is used to build the session object your frontend can access via useSession() or getServerSession().
    async session({ session, token }) {
      if (session.user) {
        session.user._id = token._id;
        session.user.role = token.role;
      }

      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
