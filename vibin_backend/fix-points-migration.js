/**
 * Migration script to fix incorrect point values in the database
 * This script should be run once to clean up any existing data issues
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibin_quest';

async function fixPointsMigration() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const spotifyInfoCollection = db.collection('spotifyinfos');
    
    // Find all documents with negative or invalid point values
    const problematicDocs = await spotifyInfoCollection.find({
      $or: [
        { totalBasePoints: { $lt: 0 } },
        { volumeScore: { $lt: 0 } },
        { diversityScore: { $lt: 0 } },
        { historyScore: { $lt: 0 } },
        { referralScore: { $lt: 0 } },
        { point: { $lt: 0 } }
      ]
    }).toArray();
    
    console.log(`🔍 Found ${problematicDocs.length} documents with negative point values`);
    
    if (problematicDocs.length === 0) {
      console.log('✅ No problematic documents found. Database is clean!');
      return;
    }
    
    // Fix each problematic document
    for (const doc of problematicDocs) {
      console.log(`🔧 Fixing document for ${doc.spotifyEmail}:`);
      console.log(`  Before: totalBasePoints=${doc.totalBasePoints}, volumeScore=${doc.volumeScore}, diversityScore=${doc.diversityScore}, historyScore=${doc.historyScore}, referralScore=${doc.referralScore}`);
      
      // Calculate correct points based on current data
      const volumeScore = Math.max(0, doc.tracksPlayedCount || 0);
      const diversityScore = Math.max(0, (doc.uniqueArtistCount || 0) * 10);
      const historyScore = Math.max(0, Math.floor((doc.listeningTime || 0) / 60000));
      const referralScore = Math.max(0, doc.referralScore || 0);
      
      // Calculate total base points
      const totalBasePoints = volumeScore + diversityScore + historyScore + referralScore;
      
      // Update the document
      const updateResult = await spotifyInfoCollection.updateOne(
        { _id: doc._id },
        {
          $set: {
            volumeScore,
            diversityScore,
            historyScore,
            referralScore,
            totalBasePoints,
            point: volumeScore + diversityScore + historyScore, // Spotify-only points
            updatedAt: new Date()
          }
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log(`  ✅ Fixed: totalBasePoints=${totalBasePoints}, volumeScore=${volumeScore}, diversityScore=${diversityScore}, historyScore=${historyScore}, referralScore=${referralScore}`);
      } else {
        console.log(`  ❌ Failed to update document`);
      }
    }
    
    // Verify the fix
    const remainingProblematicDocs = await spotifyInfoCollection.find({
      $or: [
        { totalBasePoints: { $lt: 0 } },
        { volumeScore: { $lt: 0 } },
        { diversityScore: { $lt: 0 } },
        { historyScore: { $lt: 0 } },
        { referralScore: { $lt: 0 } },
        { point: { $lt: 0 } }
      ]
    }).toArray();
    
    if (remainingProblematicDocs.length === 0) {
      console.log('✅ Migration completed successfully! All negative point values have been fixed.');
    } else {
      console.log(`❌ Migration incomplete. ${remainingProblematicDocs.length} documents still have issues.`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  fixPointsMigration()
    .then(() => {
      console.log('🏁 Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixPointsMigration };
