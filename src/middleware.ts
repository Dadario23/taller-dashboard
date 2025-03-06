import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = {
  dashboard: "/dashboard",
  home: "/home",
  signIn: "/sign-in",
};

export async function middleware(req: NextRequest) {
  try {
    // Obtener el token JWT del usuario
    const token = await getToken({ req });
    console.log("Token en middleware:", token);

    // Obtener el pathname actual (ruta solicitada)
    const currentPath = req.nextUrl.pathname;
    console.log("Ruta solicitada:", currentPath);

    // Si no hay token (usuario no autenticado) y no está en la página de sign-in, redirigir al sign-in
    if (!token && currentPath !== AUTH_ROUTES.signIn) {
      console.log("Usuario no autenticado, redirigiendo a sign-in");
      return NextResponse.redirect(new URL(AUTH_ROUTES.signIn, req.url));
    }

    // Si el usuario está autenticado y está en la página de sign-in, redirigir al dashboard
    if (token && currentPath === AUTH_ROUTES.signIn) {
      console.log("Usuario autenticado, redirigiendo a dashboard");
      return NextResponse.redirect(new URL(AUTH_ROUTES.dashboard, req.url));
    }

    // Obtener el rol del usuario desde el token
    const userRole = token?.role;
    console.log("Rol del usuario:", userRole);

    // Redirigir según el rol del usuario y la ruta solicitada
    if (
      currentPath.startsWith(AUTH_ROUTES.dashboard) &&
      userRole === "client"
    ) {
      console.log("Usuario no autorizado para dashboard, redirigiendo a home");
      return NextResponse.redirect(new URL(AUTH_ROUTES.home, req.url));
    }

    if (currentPath.startsWith(AUTH_ROUTES.home) && userRole !== "client") {
      console.log("Usuario no autorizado para home, redirigiendo a dashboard");
      return NextResponse.redirect(new URL(AUTH_ROUTES.dashboard, req.url));
    }

    // Si todo está bien, permitir el acceso
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // Si ocurre un error, redirigir al sign-in
    return NextResponse.redirect(new URL(AUTH_ROUTES.signIn, req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/repairs/:path*",
    "/settings/:path*",
    "/users/:path*",
    "/chats/:path*",
    "/apps/:path*",
  ],
};
