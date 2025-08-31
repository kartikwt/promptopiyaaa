import { createAuthMiddleware } from 'cosmic-authentication';

export const middleware = createAuthMiddleware({
  protectedRoutes: [
    '/admin',
    '/admin/*',
  ]
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/|favicon.ico).*)',
  ]
};