import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"; // Add this import
import bcrypt from "bcryptjs"; // Add this for password hashing (npm install bcryptjs)

const handler = NextAuth({
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
      },
      async authorize(credentials) {
        // Handle both login and signup based on the 'action' param from the frontend
        const { email, password, action } = credentials;

        // TODO: Replace this with your actual database query (e.g., Prisma, Supabase, etc.)
        // For demo purposes, we'll use a simple in-memory "DB" – NOT for production!
        // In production: Query your DB for the user by email.
        let user = null;

        if (action === "signup") {
          // Check if user already exists
          // TODO: In DB: const existingUser = await prisma.user.findUnique({ where: { email } });
          // For demo: Simulate with localStorage (insecure, just for testing)
          const storedUsers = JSON.parse(localStorage.getItem("demoUsers") || "[]");
          const existingUser = storedUsers.find((u) => u.email === email);

          if (existingUser) {
            throw new Error("EmailCreateAccount"); // User already exists
          }

          // Hash password and create user
          // TODO: In DB: const hashedPassword = await bcrypt.hash(password, 12); then prisma.user.create(...)
          const hashedPassword = await bcrypt.hash(password, 12);
          user = {
            id: Date.now().toString(), // Generate ID
            email,
            name: email.split("@")[0], // Simple name derivation
            hashedPassword,
          };

          // For demo: Save to localStorage
          storedUsers.push(user);
          localStorage.setItem("demoUsers", JSON.stringify(storedUsers));
        } else {
          // Login: Find user and verify password
          // TODO: In DB: const user = await prisma.user.findUnique({ where: { email } });
          // if (!user || !bcrypt.compareSync(password, user.hashedPassword)) { throw new Error("CredentialsSignin"); }
          const storedUsers = JSON.parse(localStorage.getItem("demoUsers") || "[]");
          user = storedUsers.find((u) => u.email === email);

          if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
            throw new Error("CredentialsSignin");
          }
        }

        // Return user object (without password)
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }

        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      // Persist OAuth tokens to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;  // Add this for the ID token
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;  // Add this for the ID token
      return session;
    },
  },
  pages: {
    error: "/", // Redirect errors back to login page
  },
});

export { handler as GET, handler as POST };