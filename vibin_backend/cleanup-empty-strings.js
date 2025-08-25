const mongoose = require('mongoose')
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin')

// User Schema (simplified for cleanup)
const userSchema = new mongoose.Schema({
  walletAddress: String,
  xId: String,
  telegramId: String,
  email: String,
  spotifyId: String
})

const User = mongoose.model('User', userSchema)

async function cleanupEmptyStrings() {
  try {
    console.log('Starting cleanup of empty strings...')
    
    // Find all users with empty string social IDs
    const usersWithEmptyStrings = await User.find({
      $or: [
        { xId: '' },
        { telegramId: '' },
        { email: '' },
        { spotifyId: '' }
      ]
    })
    
    console.log(`Found ${usersWithEmptyStrings.length} users with empty string social IDs`)
    
    if (usersWithEmptyStrings.length === 0) {
      console.log('✅ No empty strings found. Cleanup not needed.')
      return
    }
    
    // Update users to convert empty strings to null
    let updatedCount = 0
    
    for (const user of usersWithEmptyStrings) {
      const updateData = {}
      
      if (user.xId === '') {
        updateData.xId = null
      }
      if (user.telegramId === '') {
        updateData.telegramId = null
      }
      if (user.email === '') {
        updateData.email = null
      }
      if (user.spotifyId === '') {
        updateData.spotifyId = null
      }
      
      if (Object.keys(updateData).length > 0) {
        await User.updateOne(
          { _id: user._id },
          { $set: updateData }
        )
        updatedCount++
        
        console.log(`Updated user ${user.walletAddress}: ${Object.keys(updateData).join(', ')} set to null`)
      }
    }
    
    console.log(`✅ Cleanup completed. Updated ${updatedCount} users.`)
    
    // Verify cleanup
    const remainingEmptyStrings = await User.find({
      $or: [
        { xId: '' },
        { telegramId: '' },
        { email: '' },
        { spotifyId: '' }
      ]
    })
    
    if (remainingEmptyStrings.length === 0) {
      console.log('✅ Verification passed. No empty strings remaining.')
    } else {
      console.log(`⚠️  Warning: ${remainingEmptyStrings.length} users still have empty strings.`)
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Cleanup completed.')
  }
}

// Run cleanup
cleanupEmptyStrings() 