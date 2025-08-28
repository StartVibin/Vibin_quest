import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require full authentication
const protectedRoutes = ['/dashboard', '/leaderboard', '/staking', '/referal'];
// Define join routes that require partial authentication
const joinRoutes = ['/join', '/join/spotify', '/join/wallet', '/join/complete'];
// Define public routes that don't require authentication
const publicRoutes = ['/invite', '/invite/code'];

export function middleware(request: NextRequest) {
  console.log("checking route", request.nextUrl.pathname)
  const { pathname } = request.nextUrl;
  
  // Check if it's a public route (allow access without any checks)
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check if it's a protected route
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // For protected routes, check if user has completed full authentication
    // Note: invitationCode is not required for dashboard access
    const spotifyId = request.cookies.get('spotify_id')?.value || 
                     request.headers.get('x-spotify-id') || 
                     request.nextUrl.searchParams.get('spotify_id');
    
    const spotifyEmail = request.cookies.get('spotify_email')?.value || 
                        request.headers.get('x-spotify-email') || 
                        request.nextUrl.searchParams.get('spotify_email');
    
    const spotifyAccessToken = request.cookies.get('spotify_access_token')?.value || 
                              request.headers.get('x-spotify-token') || 
                              request.nextUrl.searchParams.get('spotify_access_token');
    
    // If any required auth data is missing, redirect to home
    if (!spotifyId || !spotifyEmail || !spotifyAccessToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Check if it's a join route
  // if (joinRoutes.some(route => pathname.startsWith(route))) {
  //   // For join routes, check if user has invitation code OR is an existing user
  //   const invitationCode = request.cookies.get('inviteCode')?.value || 
  //                         request.headers.get('x-invite-code') || 
  //                         request.nextUrl.searchParams.get('inviteCode');
    
  //   // Check if user is an existing user (has spotify credentials)
  //   const spotifyId = request.cookies.get('spotify_id')?.value || 
  //                    request.headers.get('x-spotify-id') || 
  //                    request.nextUrl.searchParams.get('spotify_id');
    
  //   const spotifyEmail = request.cookies.get('spotify_email')?.value || 
  //                       request.headers.get('x-spotify-email') || 
  //                       request.nextUrl.searchParams.get('spotify_email');

  //   console.log("checking if user is existing or not", invitationCode, spotifyId, spotifyEmail)
    
  //   // Allow access if user has invitation code OR is an existing user
  //   if (!invitationCode && !spotifyId && !spotifyEmail) {
  //     return NextResponse.redirect(new URL('/join', request.url));
  //   }
  // }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
