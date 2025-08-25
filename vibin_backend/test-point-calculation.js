/**
 * Test script to verify point calculation logic
 * This script tests the calculateSpotifyPoints and calculateReferralPoints functions
 */

const { calculateSpotifyPoints, calculateReferralPoints } = require('./src/utils/spotifyPoints');

// Mock SpotifyInfo collection for testing
const mockSpotifyInfo = {
  findOne: async (query) => {
    // Mock data for testing
    if (query.spotifyEmail === 'test@example.com') {
      return {
        invitedUsers: ['user1@example.com', 'user2@example.com'],
        totalBasePoints: 1000
      };
    } else if (query.spotifyEmail === 'user1@example.com') {
      return {
        totalBasePoints: 500,
        invitedUsers: ['user3@example.com']
      };
    } else if (query.spotifyEmail === 'user2@example.com') {
      return {
        totalBasePoints: 300,
        invitedUsers: []
      };
    } else if (query.spotifyEmail === 'user3@example.com') {
      return {
        totalBasePoints: 200,
        invitedUsers: []
      };
    }
    return null;
  }
};

async function testPointCalculations() {
  console.log('🧪 Testing Point Calculation Logic\n');
  
  // Test 1: Basic Spotify points calculation
  console.log('📊 Test 1: Basic Spotify Points Calculation');
  const testCases = [
    { listeningTime: 60000, uniqueArtistCount: 5, tracksPlayedCount: 10 }, // 1 min, 5 artists, 10 tracks
    { listeningTime: 300000, uniqueArtistCount: 10, tracksPlayedCount: 25 }, // 5 min, 10 artists, 25 tracks
    { listeningTime: 0, uniqueArtistCount: 0, tracksPlayedCount: 0 }, // Edge case: all zeros
    { listeningTime: -1000, uniqueArtistCount: -5, tracksPlayedCount: -10 }, // Edge case: negative values
    { listeningTime: 3600000, uniqueArtistCount: 20, tracksPlayedCount: 100 }, // 1 hour, 20 artists, 100 tracks
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n  Case ${index + 1}:`, testCase);
    const result = calculateSpotifyPoints(testCase);
    console.log(`    Result:`, result);
    
    // Verify no negative values
    if (result.points < 0 || result.volumePoints < 0 || result.diversityPoints < 0 || result.historyPoints < 0) {
      console.log(`    ❌ ERROR: Negative values detected!`);
    } else {
      console.log(`    ✅ All values are non-negative`);
    }
    
    // Verify calculation logic
    const expectedPoints = result.volumePoints + result.diversityPoints + result.historyPoints;
    if (result.points === expectedPoints) {
      console.log(`    ✅ Total points calculation is correct`);
    } else {
      console.log(`    ❌ ERROR: Total points mismatch! Expected: ${expectedPoints}, Got: ${result.points}`);
    }
  });
  
  // Test 2: Referral points calculation
  console.log('\n📊 Test 2: Referral Points Calculation');
  try {
    const referralPoints = await calculateReferralPoints('test@example.com', mockSpotifyInfo);
    console.log(`  Referral points for test@example.com: ${referralPoints}`);
    
    if (referralPoints >= 0) {
      console.log(`  ✅ Referral points are non-negative`);
    } else {
      console.log(`  ❌ ERROR: Negative referral points detected!`);
    }
  } catch (error) {
    console.log(`  ❌ ERROR: Referral calculation failed:`, error.message);
  }
  
  // Test 3: Edge cases and validation
  console.log('\n📊 Test 3: Edge Cases and Validation');
  
  // Test with undefined/null values
  const edgeCaseResult = calculateSpotifyPoints({
    listeningTime: undefined,
    uniqueArtistCount: null,
    tracksPlayedCount: 'invalid'
  });
  console.log(`  Edge case result:`, edgeCaseResult);
  
  if (edgeCaseResult.points >= 0) {
    console.log(`  ✅ Edge case handling works correctly`);
  } else {
    console.log(`  ❌ ERROR: Edge case produced negative values!`);
  }
  
  // Test 4: Performance test with large numbers
  console.log('\n📊 Test 4: Performance Test with Large Numbers');
  const largeNumbersResult = calculateSpotifyPoints({
    listeningTime: 999999999999, // Very large listening time
    uniqueArtistCount: 10000, // 10k artists
    tracksPlayedCount: 100000 // 100k tracks
  });
  console.log(`  Large numbers result:`, largeNumbersResult);
  
  if (largeNumbersResult.points >= 0 && isFinite(largeNumbersResult.points)) {
    console.log(`  ✅ Large numbers handled correctly`);
  } else {
    console.log(`  ❌ ERROR: Large numbers caused issues!`);
  }
  
  console.log('\n🏁 Point Calculation Tests Completed!');
}

// Run tests
if (require.main === module) {
  testPointCalculations()
    .then(() => {
      console.log('\n✅ All tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Tests failed:', error);
      process.exit(1);
    });
}

module.exports = { testPointCalculations };
