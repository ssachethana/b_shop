import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import  prisma  from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) return null;

  const user = await prisma.user.findUnique({
    where: { email: credentials.email as string },
  });

  if (!user || !user.isActive) return null;

  const passwordsMatch = await bcrypt.compare(
    credentials.password as string,
    user.password
  );

  if (!passwordsMatch) return null;

  // owner shop first, otherwise a shop they're staff on
  const shop = await prisma.shop.findFirst({
    where: {
      OR: [
        { ownerId: user.id },
        { staff: { some: { userId: user.id } } },
      ],
    },
    select: { id: true, name: true },
  });

  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    shopId: shop?.id ?? null,
    shopName: shop?.name ?? null,
  };
},
    }),
  ],
  pages: {
    signIn: "/login", 
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Add `trigger` and `session` (which contains the update payload) to the parameters
    async jwt({ token, user, trigger, session }) {
      // 1. Initial Sign-in: Populate token with user data
      if (user) {
        token.id = user.id;
        token.shopId = user.shopId ?? null;
        token.shopName = user.shopName ?? null;
      }
      
      // 2. Handle Session Updates
      if (trigger === "update" && session) {
        // If the update payload includes a new shopId/shopName, overwrite the token
        if (session.shopId !== undefined) {
          token.shopId = session.shopId;
        }
        if (session.shopName !== undefined) {
          token.shopName = session.shopName;
        }
      }

      return token;
    },
    
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.shopId = (token.shopId as number) ?? null;
        session.user.shopName = (token.shopName as string) ?? null;
      }
      return session;
    },
  },
});