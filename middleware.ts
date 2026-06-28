// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes publiques
const PUBLIC_ROUTES = ['/login', '/logout', '/mot-de-passe-oublie']

// Routes protégées par rôle
const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['administrateur'],
  '/pasteur': ['pasteur', 'administrateur'],
  '/tresorier': ['tresorier', 'administrateur'],
  '/secretaire': ['secretaire', 'administrateur'],
  '/chef-departement': ['chef_departement', 'administrateur'],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('🔍 Middleware - Path:', pathname)

  // Vérifier si la route est publique
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route)
  
  if (isPublicRoute) {
    console.log('✅ Route publique')
    return NextResponse.next()
  }

  // Récupérer le token depuis les cookies
  const token = request.cookies.get('token')?.value
  const role = request.cookies.get('role')?.value

  console.log('🔍 Token:', !!token, 'Role:', role)

  // Si pas de token, rediriger vers login
  if (!token) {
    console.log('🔴 Pas de token, redirection vers /login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Vérifier le rôle pour les routes protégées
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!role || !allowedRoles.includes(role)) {
        console.log(`🔴 Rôle non autorisé pour ${route}`)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      console.log(`✅ Rôle autorisé pour ${route}`)
      break
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
}