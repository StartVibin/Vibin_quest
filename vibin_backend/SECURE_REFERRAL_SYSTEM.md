# Secure Referral System Documentation

## Overview

This system implements a secure one-to-one mapping between users and their social accounts to prevent malicious users from re-registering with the same social accounts using different wallets. It also includes a secure referral system that only awards points after verifying all social connections.

## Key Features

### 1. One-to-One Social Account Mapping
- **X/Twitter**: One X account per wallet
- **Telegram**: One Telegram account per wallet  
- **Email**: One email per wallet
- **Spotify**: One Spotify account per wallet

### 2. Secure Referral System
- Referral points are only awarded after all 3 social platforms (X, Telegram, Email) are connected
- System checks for duplicate social accounts across different wallets
- Prevents malicious users from creating multiple wallets with the same social accounts

## Database Schema Changes

### Indexes Added (Application-Level Uniqueness)
```javascript
// X/Twitter user data
xId: {
  type: String,
  default: null,
  trim: true,
  index: true
}

// Telegram user data
telegramId: {
  type: String,
  default: null,
  trim: true,
  index: true
}

// Email data
email: {
  type: String,
  default: null,
  trim: true,
  index: true
}

// Spotify data
spotifyId: {
  type: String,
  default: null,
  trim: true,
  index: true
}
```

**Note**: Uniqueness is enforced at the application level, not the database level, to avoid issues with null values.

### New Static Methods
```javascript
// Check if social account exists
User.checkSocialAccountExists(socialData)

// Find users by social IDs
User.findByXId(xId)
User.findByTelegramId(telegramId)
User.findByEmail(email)
User.findBySpotifyId(spotifyId)
```

## API Endpoints

### 1. Verify and Award Referral Points
**POST** `/api/referrals/verify/:walletAddress`

Verifies all social connections and awards referral points if eligible.

**Requirements:**
- User must have been invited (has `invitedBy` and `inviteCode`)
- All 3 social platforms (X, Telegram, Email) must be connected
- No duplicate social accounts across different wallets
- Referral points not already awarded

**Response:**
```json
{
  "success": true,
  "message": "Referral points awarded successfully",
  "data": {
    "walletAddress": "0x...",
    "referralPointsAwarded": 500,
    "totalReferralPoints": 500,
    "totalPoints": 1500,
    "socialConnections": {
      "xConnected": true,
      "telegramConnected": true,
      "emailConnected": true
    },
    "inviterWallet": "0x...",
    "inviterPointsAwarded": 500
  }
}
```

### 2. Check Social Account Status
**GET** `/api/referrals/status/:walletAddress`

Checks the status of social connections and eligibility for referral points.

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x...",
    "socialConnections": {
      "xConnected": true,
      "telegramConnected": true,
      "emailConnected": true
    },
    "connectedCount": 3,
    "requiredCount": 3,
    "isEligibleForReferral": true,
    "duplicateAccounts": [],
    "referralPoints": 0,
    "invitedBy": "0x...",
    "hasInviteCode": true
  }
}
```

### 3. Get Referral Statistics
**GET** `/api/referrals/stats/:walletAddress`

Gets detailed referral statistics for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x...",
    "inviteCode": "ABC12345",
    "referralPoints": 500,
    "totalInvitedUsers": 2,
    "inviter": {
      "walletAddress": "0x...",
      "totalPoints": 2000
    },
    "invitedUsers": [
      {
        "walletAddress": "0x...",
        "totalPoints": 1500,
        "socialConnections": {
          "xConnected": true,
          "telegramConnected": true,
          "emailConnected": true
        },
        "joinedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalReferralPointsEarned": 500
  }
}
```

## Social Connection Security

### X/Twitter Connection
When a user connects their X account, the system:
1. Checks if the X ID is already connected to another wallet
2. If yes, returns an error with the existing wallet address
3. If no, allows the connection and updates the user record

### Telegram Connection
When a user connects their Telegram account, the system:
1. Checks if the Telegram ID is already connected to another wallet
2. If yes, returns an error with the existing wallet address
3. If no, allows the connection and updates the user record

### Email Connection
When a user connects their email, the system:
1. Checks if the email is already connected to another wallet
2. If yes, returns an error with the existing wallet address
3. If no, allows the connection and updates the user record

### Spotify Connection
When a user connects their Spotify account, the system:
1. Checks if the Spotify ID is already connected to another wallet
2. If yes, returns an error with the existing wallet address
3. If no, allows the connection and updates the user record

## Error Responses

### Duplicate Social Account
```json
{
  "success": false,
  "message": "X account is already connected to wallet: 0x...",
  "data": {
    "existingWallet": "0x...",
    "currentWallet": "0x..."
  }
}
```

### Incomplete Social Connections
```json
{
  "success": false,
  "message": "All three social platforms (X, Telegram, Email) must be connected to receive referral points",
  "data": {
    "walletAddress": "0x...",
    "socialConnections": {
      "xConnected": true,
      "telegramConnected": true,
      "emailConnected": false
    },
    "connectedCount": 2,
    "requiredCount": 3
  }
}
```

## Migration

### Running the Migration Scripts
```bash
# Step 1: Clean up existing empty strings
node cleanup-empty-strings.js

# Step 2: Add unique constraints
node migrate-unique-constraints.js
```

The migration process:
1. **Cleanup Script**: Converts existing empty strings to null values
2. **Migration Script**: 
   - Checks for existing duplicate social accounts
   - Reports any duplicates found
   - Creates indexes for performance (uniqueness enforced at application level)
   - Verifies the indexes were created successfully

### Handling Duplicates
If duplicates are found during migration:
1. Manually resolve duplicates by removing duplicate connections
2. Or update the migration script to handle duplicates automatically
3. Re-run the migration script

## Security Benefits

1. **Prevents Sybil Attacks**: Users cannot create multiple accounts with the same social identities
2. **Secure Referral System**: Only legitimate users with verified social accounts receive referral points
3. **Audit Trail**: All social connections are tracked and can be audited
4. **Duplicate Detection**: System automatically detects and prevents duplicate social account connections

## Implementation Notes

- All wallet addresses are stored in lowercase for consistency
- Social IDs are converted to strings to ensure proper comparison
- Uniqueness is enforced at the application level to avoid database constraint issues
- Empty strings are converted to null for consistency
- Referral points are only awarded once per user
- The system logs all referral point awards for audit purposes 