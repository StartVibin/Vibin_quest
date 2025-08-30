export function calculateSpotifyPoints({
  listeningTime = 0,
  uniqueArtistCount = 0,
  tracksPlayedCount = 0
}: {
  listeningTime?: number,
  uniqueArtistCount?: number,
  tracksPlayedCount?: number
}) {
  let points = 0;
  
  // 10 point per unique artist
  let diversityPoints = uniqueArtistCount * 10;
  
  // 1 point per track played
  let volumePoints = tracksPlayedCount;
  
  // 1 point per 1 minute of listening time (60,000 ms)
  let historyPoints = Math.floor(listeningTime / 60000);

  points = diversityPoints + volumePoints + historyPoints;
  
  return {points, diversityPoints, volumePoints, historyPoints};
}

export async function calculateReferralPoints(spotifyEmail: string, SpotifyInfo: any) {
  console.log(`\n🔍 Calculating referral points for user: ${spotifyEmail}`)
  
  let totalReferralPoints = 0;
  
  // Get the user's referral code
  const user = await SpotifyInfo.findOne({ spotifyEmail: spotifyEmail.toLowerCase() });
  if (!user || !user.referralCode) {
    console.log(`❌ User not found or no referral code: ${spotifyEmail}`)
    return 0;
  }
  
  console.log(`👤 User found: ${user.spotifyEmail}`)
  console.log(`🔑 Referral Code: ${user.referralCode}`)
  
  // Find all users whose invitation code matches this user's referral code
  const invitedUsers = await SpotifyInfo.find({ invitationCode: user.referralCode });
  
  console.log(`🔍 Found ${invitedUsers.length} users who used invitation code: ${user.referralCode}`)
  
  // Calculate referral points from users who used this user's invitation code
  for (const invitedUser of invitedUsers) {
    if (invitedUser.totalBasePoints) {
      // 20% of invited user's total base points
      const referralPoints = invitedUser.totalBasePoints * 0.2;
      totalReferralPoints += referralPoints;
      
      console.log(`  📈 ${invitedUser.spotifyEmail}: ${invitedUser.totalBasePoints} base points → ${referralPoints.toFixed(2)} referral points (20%)`)
    } else {
      console.log(`  ⚠️  ${invitedUser.spotifyEmail}: No totalBasePoints found`)
    }
  }
  
  console.log(`💰 Total referral points calculated: ${totalReferralPoints.toFixed(2)}`)
  console.log(`✅ Final referral points (floored): ${Math.floor(totalReferralPoints)}`)
  
  return Math.floor(totalReferralPoints);
}

// New function to calculate today's referral points
export async function calculateTodayReferralPoints(spotifyEmail: string, SpotifyInfo: any) {
  console.log(`\n🌅 Calculating today's referral points for user: ${spotifyEmail}`)
  
  let todayReferralPoints = 0;
  
  // Get the user's referral code
  const user = await SpotifyInfo.findOne({ spotifyEmail: spotifyEmail.toLowerCase() });
  if (!user || !user.referralCode) {
    console.log(`❌ User not found or no referral code: ${spotifyEmail}`)
    return 0;
  }
  
  console.log(`👤 User found: ${user.spotifyEmail}`)
  console.log(`🔑 Referral Code: ${user.referralCode}`)
  
  const today = new Date();
  const todayString = today.toDateString();
  console.log(`📅 Today's date: ${todayString}`)
  
  // Find all users whose invitation code matches this user's referral code
  const invitedUsers = await SpotifyInfo.find({ invitationCode: user.referralCode });
  
  console.log(`🔍 Found ${invitedUsers.length} users who used invitation code: ${user.referralCode}`)
  
  // Calculate today's referral points from users who used this user's invitation code
  for (const invitedUser of invitedUsers) {
    if (invitedUser.totalBasePoints) {
      // Check if the invited user earned points today
      const userUpdatedToday = invitedUser.updatedAt.toDateString() === todayString;
      
      console.log(`  📊 ${invitedUser.spotifyEmail}: ${invitedUser.totalBasePoints} base points`)
      console.log(`    • Last updated: ${invitedUser.updatedAt.toDateString()}`)
      console.log(`    • Updated today: ${userUpdatedToday ? '✅ Yes' : '❌ No'}`)
      
      if (userUpdatedToday) {
        // 20% of invited user's total base points earned today
        const referralPoints = invitedUser.totalBasePoints * 0.2;
        todayReferralPoints += referralPoints;
        console.log(`    • Today's referral points: ${referralPoints.toFixed(2)} (20%)`)
      }
    } else {
      console.log(`  ⚠️  ${invitedUser.spotifyEmail}: No totalBasePoints found`)
    }
  }
  
  console.log(`💰 Total today's referral points: ${todayReferralPoints.toFixed(2)}`)
  console.log(`✅ Final today's referral points (floored): ${Math.floor(todayReferralPoints)}`)
  
  return Math.floor(todayReferralPoints);
} 
