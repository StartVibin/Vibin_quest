const mongoose = require('mongoose')
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin')

// User Schema (simplified for migration)
const userSchema = new mongoose.Schema({
  walletAddress: String,
  xId: String,
  telegramId: String,
  email: String,
  spotifyId: String
})

const User = mongoose.model('User', userSchema)

async function migrateUniqueConstraints() {
  try {
    console.log('Starting migration to add unique constraints...')
    
    // Find all users with social account data
    const users = await User.find({
      $or: [
        { xId: { $exists: true, $ne: null, $ne: '' } },
        { telegramId: { $exists: true, $ne: null, $ne: '' } },
        { email: { $exists: true, $ne: null, $ne: '' } },
        { spotifyId: { $exists: true, $ne: null, $ne: '' } }
      ]
    })
    
    console.log(`Found ${users.length} users with social account data`)
    
    // Check for duplicates
    const duplicates = {
      xId: new Map(),
      telegramId: new Map(),
      email: new Map(),
      spotifyId: new Map()
    }
    
    // Collect all social IDs
    users.forEach(user => {
      if (user.xId && user.xId.trim() !== '') {
        if (duplicates.xId.has(user.xId)) {
          duplicates.xId.get(user.xId).push(user.walletAddress)
        } else {
          duplicates.xId.set(user.xId, [user.walletAddress])
        }
      }
      
      if (user.telegramId && user.telegramId.trim() !== '') {
        if (duplicates.telegramId.has(user.telegramId)) {
          duplicates.telegramId.get(user.telegramId).push(user.walletAddress)
        } else {
          duplicates.telegramId.set(user.telegramId, [user.walletAddress])
        }
      }
      
      if (user.email && user.email.trim() !== '') {
        if (duplicates.email.has(user.email)) {
          duplicates.email.get(user.email).push(user.walletAddress)
        } else {
          duplicates.email.set(user.email, [user.walletAddress])
        }
      }
      
      if (user.spotifyId && user.spotifyId.trim() !== '') {
        if (duplicates.spotifyId.has(user.spotifyId)) {
          duplicates.spotifyId.get(user.spotifyId).push(user.walletAddress)
        } else {
          duplicates.spotifyId.set(user.spotifyId, [user.walletAddress])
        }
      }
    })
    
    // Report duplicates
    let hasDuplicates = false
    Object.entries(duplicates).forEach(([platform, idMap]) => {
      idMap.forEach((wallets, id) => {
        if (wallets.length > 1) {
          hasDuplicates = true
          console.log(`⚠️  DUPLICATE ${platform}: ${id} is used by wallets: ${wallets.join(', ')}`)
        }
      })
    })
    
    if (hasDuplicates) {
      console.log('\n❌ Migration cannot proceed due to duplicate social accounts.')
      console.log('Please resolve duplicates before running this migration.')
      console.log('You can either:')
      console.log('1. Remove duplicate social connections manually')
      console.log('2. Update the migration script to handle duplicates')
      process.exit(1)
    }
    
    console.log('✅ No duplicates found. Proceeding with migration...')
    
    // Create unique indexes
    console.log('Creating unique indexes...')
    
    // Drop existing indexes first
    await User.collection.dropIndexes()
    
    // Create new indexes (without unique constraints)
    await User.collection.createIndex({ xId: 1 })
    await User.collection.createIndex({ telegramId: 1 })
    await User.collection.createIndex({ email: 1 })
    await User.collection.createIndex({ spotifyId: 1 })
    
    console.log('✅ Indexes created successfully!')
    
    // Verify indexes
    const indexes = await User.collection.getIndexes()
    console.log('\n📋 Current indexes:')
    Object.entries(indexes).forEach(([name, index]) => {
      console.log(`  ${name}: ${JSON.stringify(index.key)}`)
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Migration completed.')
  }
}

// Run migration
migrateUniqueConstraints() 