// Discord utility functions for OAuth and verification

export async function exchangeCodeForToken(code: string): Promise<string | null> {
  try {
    const response = await fetch('/api/discord/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      console.error('Failed to exchange code for token:', response.statusText)
      return null
    }

    const data = await response.json()
    return data.access_token || null
  } catch (error) {
    console.error('Error exchanging code for token:', error)
    return null
  }
}

export async function verifyDiscordMembership(accessToken: string): Promise<boolean> {
  try {
    // Get the Discord server ID from environment variables
    const serverId = process.env.DISCORD_SERVER_ID
    
    if (!serverId) {
      console.error('Discord server ID not configured')
      return false
    }

    // Check if user is a member of the specified server
    const response = await fetch(`https://discord.com/api/users/@me/guilds/${serverId}/member`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Error verifying Discord membership:', error)
    return false
  }
}

export async function getDiscordUser(accessToken: string): Promise<any | null> {
  try {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch Discord user:', response.statusText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Discord user:', error)
    return null
  }
} 