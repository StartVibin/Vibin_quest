# Spotify OAuth Scopes Guide

## 🚨 **"Insufficient client scope" Error**

This error occurs when your Spotify OAuth application doesn't have the required permissions (scopes) to perform the requested action.

## 📋 **Current Spotify API Endpoints Used**

Based on your `SpotifyService`, here are the endpoints your app uses:

| Endpoint | Method | Required Scope | Purpose |
|----------|--------|----------------|---------|
| `/me` | GET | `user-read-email`, `user-read-private` | Get user profile |
| `/me/top/tracks` | GET | `user-top-read` | Get user's top tracks |
| `/me/top/artists` | GET | `user-top-read` | Get user's top artists |
| `/me/player/recently-played` | GET | `user-read-recently-played` | Get recently played tracks |
| `/me/playlists` | GET | `playlist-read-private`, `playlist-read-collaborative` | Get user's playlists |
| `/me/tracks` | GET | `user-library-read` | Get user's saved tracks |
| `/me/player` | GET | `user-read-playback-state` | Get current playback |
| `/me/following` | GET | `user-follow-read` | Get followed artists |
| `/audio-features` | GET | None (public endpoint) | Get audio features |
| `/audio-analysis/{id}` | GET | None (public endpoint) | Get track analysis |

## 🔧 **Updated OAuth Scopes**

I've updated your Spotify OAuth scopes to include all necessary permissions:

```javascript
// Updated scope string in app/api/auth/spotify/route.ts
'user-read-email user-read-private user-read-recently-played user-top-read user-read-playback-state user-modify-playback-state user-library-read user-follow-read playlist-read-private playlist-read-collaborative'
```

## 📝 **Scope Breakdown**

### **Essential Scopes (Already Included)**
- `user-read-email` - Read user's email address
- `user-read-private` - Read user's private information
- `user-read-recently-played` - Read user's recently played tracks
- `user-top-read` - Read user's top tracks and artists
- `user-read-playback-state` - Read user's current playback state
- `user-modify-playback-state` - Control user's playback state

### **New Scopes Added**
- `user-library-read` - Read user's saved tracks and albums
- `user-follow-read` - Read user's followed artists
- `playlist-read-private` - Read user's private playlists
- `playlist-read-collaborative` - Read user's collaborative playlists

## 🛠️ **How to Fix the Error**

### **Step 1: Clear Existing Tokens**
Since the existing tokens don't have the new scopes, you need to re-authenticate:

```javascript
// Run this in browser //console to clear existing tokens
localStorage.removeItem('spotify_access_token');
localStorage.removeItem('spotify_refresh_token');
localStorage.removeItem('spotify_expires_in');
localStorage.removeItem('spotify_token_expiry');
localStorage.removeItem('spotify_id');
localStorage.removeItem('spotify_email');
localStorage.removeItem('spotify_name');
```

### **Step 2: Re-authenticate with Spotify**
1. Go through the registration flow again
2. When you reach the Spotify OAuth step, it will now request the additional scopes
3. The user will see a new permission screen asking for access to:
   - Your saved tracks and albums
   - Your followed artists
   - Your private playlists

### **Step 3: Verify Scopes in Spotify Dashboard**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app
3. Go to "Edit Settings"
4. Check that your redirect URI is correct: `http://127.0.0.1:3000/callback`

## 🔍 **Testing the Fix**

After re-authenticating, test these endpoints:

```javascript
// Test in browser //console
const spotifyService = new SpotifyService(localStorage.getItem('spotify_access_token'));

// Test user profile (should work)
spotifyService.getUserProfile().then(//console.log);

// Test saved tracks (should work now)
spotifyService.getSavedTracks().then(//console.log);

// Test followed artists (should work now)
spotifyService.getFollowedArtists().then(//console.log);

// Test playlists (should work now)
spotifyService.getUserPlaylists().then(//console.log);
```

## 🚨 **Common Issues**

### **1. User Denies Permissions**
If the user denies the new permissions, you'll get a 403 error. Handle this gracefully:

```javascript
try {
  const data = await spotifyService.getSavedTracks();
} catch (error) {
  if (error.message.includes('403') || error.message.includes('Insufficient client scope')) {
    // User needs to re-authenticate with new scopes
    //console.log('Please re-authenticate with Spotify to access all features');
  }
}
```

### **2. Token Refresh Issues**
When refreshing tokens, the new scopes might not be included. Always re-authenticate when adding new scopes.

### **3. Spotify App Configuration**
Ensure your Spotify app has the correct redirect URI and is properly configured.

## 📊 **Scope Requirements by Feature**

| Feature | Required Scopes |
|---------|----------------|
| User Profile | `user-read-email`, `user-read-private` |
| Top Tracks/Artists | `user-top-read` |
| Recently Played | `user-read-recently-played` |
| Saved Tracks | `user-library-read` |
| Followed Artists | `user-follow-read` |
| Playlists | `playlist-read-private`, `playlist-read-collaborative` |
| Current Playback | `user-read-playback-state` |
| Audio Features | None (public) |

## 🔧 **Future Scope Additions**

If you plan to add more features, you might need these additional scopes:

- `user-library-modify` - Modify user's saved tracks and albums
- `playlist-modify-public` - Modify public playlists
- `playlist-modify-private` - Modify private playlists
- `user-follow-modify` - Follow/unfollow artists

Remember: **Always re-authenticate when adding new scopes** as existing tokens won't have the new permissions. 