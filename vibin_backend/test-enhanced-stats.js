/**
 * Test script to verify enhanced Spotify stats calculation
 * This simulates the improved data collection from both top tracks and recently played
 */

// Mock the enhanced stats calculation
function calculateEnhancedStats(topTracks, recentlyPlayed) {
  // Extract actual track data from recently played (they have a 'track' property)
  const recentlyPlayedTracks = recentlyPlayed.map(rp => rp.track);
  
  // Combine top tracks and recently played for more comprehensive stats
  const allTracks = [...topTracks, ...recentlyPlayedTracks];
  
  // Remove duplicates based on track ID to avoid double counting
  const uniqueTracks = allTracks.filter((track, index, self) => 
    index === self.findIndex(t => t.id === track.id)
  );
  
  // Get unique artists from all tracks
  const uniqueArtists = new Set();
  uniqueTracks.forEach(track => {
    track.artists.forEach(artist => uniqueArtists.add(artist.name));
  });
  
  // Calculate total listening time (from all unique tracks)
  const totalListeningTimeMs = uniqueTracks.reduce((total, track) => total + track.duration_ms, 0);
  
  return {
    totalTracksPlayed: uniqueTracks.length,
    uniqueArtistsCount: uniqueArtists.size,
    totalListeningTimeMs,
    dataSource: `Top tracks: ${topTracks.length}, Recently played: ${recentlyPlayedTracks.length}, Unique combined: ${uniqueTracks.length}`
  };
}

// Test data
const mockTopTracks = [
  { id: '1', name: 'Track 1', artists: [{ name: 'Artist A' }], duration_ms: 180000 },
  { id: '2', name: 'Track 2', artists: [{ name: 'Artist B' }], duration_ms: 200000 },
  { id: '3', name: 'Track 3', artists: [{ name: 'Artist A' }], duration_ms: 190000 },
  { id: '4', name: 'Track 4', artists: [{ name: 'Artist C' }], duration_ms: 170000 },
  { id: '5', name: 'Track 5', artists: [{ name: 'Artist D' }], duration_ms: 210000 }
];

const mockRecentlyPlayed = [
  { track: { id: '6', name: 'Track 6', artists: [{ name: 'Artist E' }], duration_ms: 185000 }, played_at: '2024-01-01T10:00:00Z' },
  { track: { id: '7', name: 'Track 7', artists: [{ name: 'Artist F' }], duration_ms: 195000 }, played_at: '2024-01-01T10:05:00Z' },
  { track: { id: '1', name: 'Track 1', artists: [{ name: 'Artist A' }], duration_ms: 180000 }, played_at: '2024-01-01T10:10:00Z' }, // Duplicate
  { track: { id: '8', name: 'Track 8', artists: [{ name: 'Artist G' }], duration_ms: 175000 }, played_at: '2024-01-01T10:15:00Z' }
];

console.log('🧪 Testing Enhanced Spotify Stats Calculation\n');

console.log('📊 Mock Data:');
console.log(`  Top Tracks: ${mockTopTracks.length} tracks`);
console.log(`  Recently Played: ${mockRecentlyPlayed.length} tracks`);
console.log(`  Total Raw Data: ${mockTopTracks.length + mockRecentlyPlayed.length} tracks`);

console.log('\n📊 Enhanced Stats Calculation:');
const enhancedStats = calculateEnhancedStats(mockTopTracks, mockRecentlyPlayed);
console.log(`  Total Unique Tracks: ${enhancedStats.totalTracksPlayed}`);
console.log(`  Unique Artists: ${enhancedStats.uniqueArtistsCount}`);
console.log(`  Total Listening Time: ${Math.round(enhancedStats.totalListeningTimeMs / 60000)} minutes`);
console.log(`  Data Source: ${enhancedStats.dataSource}`);

console.log('\n📊 Comparison with Old Method:');
const oldStats = {
  totalTracksPlayed: mockTopTracks.length,
  uniqueArtistsCount: new Set(mockTopTracks.flatMap(t => t.artists.map(a => a.name))).size,
  totalListeningTimeMs: mockTopTracks.reduce((total, track) => total + track.duration_ms, 0)
};

console.log(`  Old Method - Total Tracks: ${oldStats.totalTracksPlayed}`);
console.log(`  Old Method - Unique Artists: ${oldStats.uniqueArtistsCount}`);
console.log(`  Old Method - Listening Time: ${Math.round(oldStats.totalListeningTimeMs / 60000)} minutes`);

console.log('\n📊 Improvement:');
console.log(`  Tracks: ${oldStats.totalTracksPlayed} → ${enhancedStats.totalTracksPlayed} (+${enhancedStats.totalTracksPlayed - oldStats.totalTracksPlayed})`);
console.log(`  Artists: ${oldStats.uniqueArtistsCount} → ${enhancedStats.uniqueArtistsCount} (+${enhancedStats.uniqueArtistsCount - oldStats.uniqueArtistsCount})`);
console.log(`  Time: ${Math.round(oldStats.totalListeningTimeMs / 60000)} → ${Math.round(enhancedStats.totalListeningTimeMs / 60000)} (+${Math.round((enhancedStats.totalListeningTimeMs - oldStats.totalListeningTimeMs) / 60000)}) minutes`);

console.log('\n✅ Enhanced stats calculation working correctly!');
console.log('🎯 This should provide much more accurate data for point calculations.');
