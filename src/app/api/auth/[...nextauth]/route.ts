import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    // Proveedor de credenciales
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Por favor, complete todos los campos.");
          }

          await connectDB();

          const userFound = await User.findOne({
            email: credentials.email,
          }).select("email password role fullname");

          console.log("Resultado de explain():", userFound);
          if (!userFound || !userFound.password) {
            throw new Error(
              "El correo no está registrado o falta la contraseña."
            );
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            userFound.password
          );
          if (!passwordMatch) {
            throw new Error("La contraseña es incorrecta.");
          }

          return {
            id: userFound._id.toString(),
            email: userFound.email,
            name: userFound.fullname,
            role: userFound.role,
          };
        } catch (error) {
          console.error("Error en la autorización:", error);
          throw new Error("Error interno del servidor.");
        }
      },
    }),

    // Proveedor de Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      await connectDB();

      if (account?.provider === "google") {
        // Busca al usuario por el `googleId` o por su correo electrónico
        const existingUser = await User.findOne({
          $or: [{ googleId: profile?.sub }, { email: profile?.email }],
        });

        if (existingUser) {
          // Si el usuario existe, actualiza el campo `googleId` si no está presente
          if (!existingUser.googleId) {
            existingUser.googleId = profile?.sub;
            await existingUser.save();
          }

          user.role = existingUser.role;
          user.redirectTo =
            existingUser.role === "admin" ? "/dashboard" : "/home";
        } else {
          // Si no existe, crea un nuevo usuario con el ID de Google
          const newUser = await User.create({
            email: profile?.email,
            fullname: profile?.name,
            provider: "google",
            googleId: profile?.sub, // Almacena el `sub` de Google
            role: "user", // Rol predeterminado
            image: profile?.picture,
          });

          user.role = newUser.role;
          user.redirectTo = "/home";
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = account?.provider === "google" ? user.id : user.id; // Ajustado para claridad
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.redirectTo = user.redirectTo || "/";
      }

      console.log("Token generado:", token); // Registro para depuración
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
      };

      session.redirectTo =
        typeof token.redirectTo === "string" ? token.redirectTo : undefined;

      console.log("Sesión generada:", session); // Registro para depuración

      return session;
    },
  },

  pages: {
    signIn: "/", // Página de inicio de sesión
    error: "/", // Maneja errores en la misma página
    signOut: "/", // Página de cierre de sesión
    // La página de carga es el callback temporal
    newUser: "/loading", // Redirige a una página intermedia
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
