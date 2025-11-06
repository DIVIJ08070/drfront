// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "https://medify-service-production.up.railway.app";

let demoUsers = [];

const config = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "string" },
      },
      async authorize(credentials) {
        const { email, password, action } = credentials || {};
        if (!email || !password) return null; // ← Fixed: was 'anonymity'

        if (action === "signup") {
          if (demoUsers.some(u => u.email === email)) throw new Error("EmailCreateAccount");
          const hashed = await bcrypt.hash(password, 12);
          const user = { id: Date.now().toString(), email, name: email.split("@")[0], hashedPassword: hashed };
          demoUsers.push(user);
          return { id: user.id, email: user.email, name: user.name };
        }

        const user = demoUsers.find(u => u.email === email);
        if (!user || !(await bcrypt.compare(password, user.hashedPassword))) throw new Error("CredentialsSignin");
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && account.id_token) {
        const googleIdToken = account.id_token;
        console.log("Sending Google ID Token to backend:", googleIdToken.substring(0, 50) + "...");

        try {
          const res = await fetch(`${BACKEND_BASE_URL}/v1/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ google_id: googleIdToken }),
          });

          console.log("Backend status:", res.status);
          if (res.ok) {
            const data = await res.json();
            console.log("Backend response:", data);

            if (data.jwt) {
              user.jwt = data.jwt;
              user.roles = data.roles || []; // ← CRITICAL: Save roles
              console.log("JWT & ROLES STORED IN USER:", data.jwt.substring(0, 20) + "...", user.roles);
              return true;
            }
          } else {
            const err = await res.json().catch(() => ({}));
            console.error("Backend error:", err);
          }
        } catch (e) {
          console.error("Fetch error:", e);
        }
      } else {
        console.log("No id_token – skipping /v1/auth");
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user?.jwt) token.jwt = user.jwt;
      if (user?.roles) token.roles = user.roles; // ← Pass to session
      return token;
    },

    async session({ session, token }) {
      session.jwt = token.jwt;
      session.roles = token.roles || []; // ← Available in useSession()
      return session;
    },
  },
  pages: { error: "/" },
};

const { handlers } = NextAuth(config);
export const GET = handlers.GET;
export const POST = handlers.POST;