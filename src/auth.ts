import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Email and Password",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "employee@concertinahr.local" },
                password: { label: "Password (Any)", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;

                // For this demo, we bypass strict password hashing and just check the email exists
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (user) {
                    // In a real app we'd verify password against user.hashedPassword here.
                    return user;
                }

                return null;
            }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || "EMPLOYEE";
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    trustHost: true,
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev_only",
});
