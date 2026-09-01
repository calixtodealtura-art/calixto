import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Filtro rápido: si ni siquiera hay cookie, ni vale la pena renderizar.
  // La verificación real (firma + rol) ocurre en admin/layout.tsx server-side.
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get('calixto-admin-token')?.value

    if (!token) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Exponemos el pathname a los Server Components (admin/layout.tsx lo usa
  // para saltear la verificación cuando la ruta es /admin/login).
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/admin/:path*'],
}