const mongoose = require('mongoose')
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin')

async function removeUniqueConstraints() {
  try {
    console.log('Removing unique constraints from social account fields...')
    
    // Wait for connection to be ready
    await mongoose.connection.asPromise()
    
    const db = mongoose.connection.db
    const collection = db.collection('users')
    
    // Get current indexes
    const indexes = await collection.listIndexes().toArray()
    console.log('Current indexes:', indexes.map(idx => idx.name))
    
    // Remove unique constraints from social fields
    const fieldsToRemove = ['xId', 'telegramId', 'email', 'spotifyId']
    
    for (const field of fieldsToRemove) {
      const indexName = `${field}_1`
      const existingIndex = indexes.find(idx => idx.name === indexName)
      
      if (existingIndex) {
        console.log(`Removing index from ${field}...`)
        await collection.dropIndex(indexName)
        console.log(`✅ Removed index from ${field}`)
      } else {
        console.log(`No index found for ${field}`)
      }
    }
    
    // Create new non-unique indexes for performance
    console.log('Creating new non-unique indexes...')
    await collection.createIndex({ xId: 1 })
    await collection.createIndex({ telegramId: 1 })
    await collection.createIndex({ email: 1 })
    await collection.createIndex({ spotifyId: 1 })
    
    console.log('✅ All unique constraints removed and new indexes created!')
    
    // Verify final state
    const finalIndexes = await collection.listIndexes().toArray()
    console.log('\n📋 Final indexes:')
    finalIndexes.forEach(index => {
      console.log(`  ${index.name}: ${JSON.stringify(index.key)}`)
    })
    
  } catch (error) {
    console.error('❌ Error removing unique constraints:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Process completed.')
  }
}

// Run the script
removeUniqueConstraints() 