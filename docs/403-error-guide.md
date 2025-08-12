# 403 Error Guide

A 403 error means "Forbidden" - the server understood the request but refuses to authorize it. Here are the most likely causes in your application:

## 🔍 **How to Identify the 403 Error**

1. **Open Browser Developer Tools** (F12)
2. **Go to //console tab** - look for 🚨 403 FORBIDDEN ERROR DETECTED
3. **Go to Network tab** - look for failed requests with 403 status
4. **Check the ErrorLogger component** - it will log all fetch requests and responses

## 🎯 **Common 403 Error Sources**

### 1. **Spotify API 403 Errors**
**Causes:**
- Invalid or expired access token
- Missing or incorrect scopes
- Rate limiting
- User revoked access

**Check:**
```javascript
// In browser //console
//console.log('Spotify tokens:', {
  accessToken: localStorage.getItem('spotify_access_token'),
  refreshToken: localStorage.getItem('spotify_refresh_token'),
  expiresIn: localStorage.getItem('spotify_expires_in'),
  tokenExpiry: localStorage.getItem('spotify_token_expiry')
});
```

**Fix:**
- Re-authenticate with Spotify
- Check if tokens are properly stored in localStorage
- Verify Spotify app configuration

### 2. **Backend API 403 Errors** (localhost:5000)
**Causes:**
- Missing authentication headers
- Invalid wallet signature
- Rate limiting
- CORS issues

**Check:**
```javascript
// Look for requests to http://localhost:5000/api/v1/*
// Check if wallet is connected and signed
```

**Fix:**
- Ensure wallet is connected
- Check if backend server is running
- Verify CORS configuration


## 🛠️ **Debugging Steps**

### Step 1: Check the ErrorLogger Output
The ErrorLogger component will show:
- Exact URL that returned 403
- Request headers and body
- Response headers
- Timestamp of the error

### Step 2: Check Registration Debug Component
Look at the RegistrationDebug component to see:
- What data is missing from localStorage/localStorage
- If OAuth tokens are properly stored

### Step 3: Check Environment Variables
Verify these are set correctly:
```bash
# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback

# X (Twitter)
NEXT_PUBLIC_X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret

# Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Telegram
BOT_TOKEN=your_telegram_bot_token
```

### Step 4: Check Backend Server
Ensure your backend server is running:
```bash
# Check if backend is running on port 5000
curl http://localhost:5000/api/v1/health
```

## 🚨 **Immediate Actions**

1. **Clear browser storage** and try again
2. **Re-authenticate** with the service that's giving 403
3. **Check if tokens are expired** and refresh them
4. **Verify the service is working** (Spotify, X, etc.)

## 📋 **Common Fixes**

### For Spotify 403:
```javascript
// Clear Spotify tokens and re-authenticate
localStorage.removeItem('spotify_access_token');
localStorage.removeItem('spotify_refresh_token');
localStorage.removeItem('spotify_expires_in');
localStorage.removeItem('spotify_token_expiry');
// Then go through Spotify OAuth again
```

### For Backend 403:
```javascript
// Ensure wallet is connected and signed
// Check if backend server is running
// Verify CORS headers
```

### For X 403:
```javascript
// Clear X tokens and re-authenticate
localStorage.removeItem('x_access_token');
localStorage.removeItem('x_refresh_token');
// Then go through X OAuth again
```

## 🔧 **Prevention**

1. **Implement proper token refresh** for all OAuth services
2. **Add error handling** for 403 responses
3. **Use proper CORS configuration** for backend
4. **Implement rate limiting** handling
5. **Add retry logic** for failed requests

## 📞 **Getting Help**

When reporting a 403 error, include:
1. **ErrorLogger output** (the 🚨 403 FORBIDDEN ERROR DETECTED log)
2. **RegistrationDebug output** (what data is missing)
3. **Browser //console logs**
4. **Network tab** showing the failed request
5. **Steps to reproduce** the error 