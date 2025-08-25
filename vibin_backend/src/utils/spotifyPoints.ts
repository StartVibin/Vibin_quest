export function calculateSpotifyPoints({
  listeningTime = 0,
  uniqueArtistCount = 0,
  tracksPlayedCount = 0
}: {
  listeningTime?: number,
  uniqueArtistCount?: number,
  tracksPlayedCount?: number
}) {
  // Ensure all values are numbers and non-negative
  const safeListeningTime = Math.max(0, Number(listeningTime) || 0);
  const safeUniqueArtistCount = Math.max(0, Number(uniqueArtistCount) || 0);
  const safeTracksPlayedCount = Math.max(0, Number(tracksPlayedCount) || 0);
  
  // Calculate individual point components
  // 10 points per unique artist
  const diversityPoints = safeUniqueArtistCount * 10;
  
  // 1 point per track played
  const volumePoints = safeTracksPlayedCount;
  
  // 1 point per 1 minute of listening time (60,000 ms)
  const historyPoints = Math.floor(safeListeningTime / 60000);

  // Calculate total points
  const totalPoints = diversityPoints + volumePoints + historyPoints;
  
  // Log calculation for debugging
  console.log('🎯 Spotify Points Calculation:', {
    input: {
      listeningTime: safeListeningTime,
      uniqueArtistCount: safeUniqueArtistCount,
      tracksPlayedCount: safeTracksPlayedCount
    },
    calculated: {
      diversityPoints,
      volumePoints,
      historyPoints,
      totalPoints
    }
  });
  
  return {
    points: totalPoints,
    diversityPoints,
    volumePoints,
    historyPoints
  };
}

export async function calculateReferralPoints(spotifyEmail: string, SpotifyInfo: any) {
  try {
    let totalReferralPoints = 0;
    
    // Get the user's invited users
    const user = await SpotifyInfo.findOne({ spotifyEmail: spotifyEmail.toLowerCase() });
    if (!user || !user.invitedUsers || user.invitedUsers.length === 0) {
      console.log(`📊 No referral points for ${spotifyEmail} - no invited users`);
      return 0;
    }
    
    console.log(`📊 Calculating referral points for ${spotifyEmail} with ${user.invitedUsers.length} invited users`);
    
    // Level 1: 20% of invited users' points
    for (const invitedEmail of user.invitedUsers) {
      const invitedUser = await SpotifyInfo.findOne({ spotifyEmail: invitedEmail.toLowerCase() });
      if (invitedUser && invitedUser.totalBasePoints) {
        const level1Points = invitedUser.totalBasePoints * 0.2;
        totalReferralPoints += level1Points;
        console.log(`  Level 1: ${invitedEmail} -> ${level1Points} points (20% of ${invitedUser.totalBasePoints})`);
      }
    }
    
    // Level 2: 10% of invited users' invited users' points
    for (const invitedEmail of user.invitedUsers) {
      const invitedUser = await SpotifyInfo.findOne({ spotifyEmail: invitedEmail.toLowerCase() });
      if (invitedUser && invitedUser.invitedUsers) {
        for (const level2Email of invitedUser.invitedUsers) {
          const level2User = await SpotifyInfo.findOne({ spotifyEmail: level2Email.toLowerCase() });
          if (level2User && level2User.totalBasePoints) {
            const level2Points = level2User.totalBasePoints * 0.1;
            totalReferralPoints += level2Points;
            console.log(`  Level 2: ${level2Email} -> ${level2Points} points (10% of ${level2User.totalBasePoints})`);
          }
        }
      }
    }
    
    // Level 3: 5% of invited users' invited users' invited users' points
    for (const invitedEmail of user.invitedUsers) {
      const invitedUser = await SpotifyInfo.findOne({ spotifyEmail: invitedEmail.toLowerCase() });
      if (invitedUser && invitedUser.invitedUsers) {
        for (const level2Email of invitedUser.invitedUsers) {
          const level2User = await SpotifyInfo.findOne({ spotifyEmail: level2Email.toLowerCase() });
          if (level2User && level2User.invitedUsers) {
            for (const level3Email of level2User.invitedUsers) {
              const level3User = await SpotifyInfo.findOne({ spotifyEmail: level3Email.toLowerCase() });
              if (level3User && level3User.totalBasePoints) {
                const level3Points = level3User.totalBasePoints * 0.05;
                totalReferralPoints += level3Points;
                console.log(`  Level 3: ${level3Email} -> ${level3Points} points (5% of ${level3User.totalBasePoints})`);
              }
            }
          }
        }
      }
    }
    
    const finalReferralPoints = Math.floor(totalReferralPoints);
    console.log(`📊 Total referral points for ${spotifyEmail}: ${finalReferralPoints} (raw: ${totalReferralPoints})`);
    
    return finalReferralPoints;
  } catch (error) {
    console.error(`❌ Error calculating referral points for ${spotifyEmail}:`, error);
    return 0; // Return 0 on error to prevent breaking the main calculation
  }
} 