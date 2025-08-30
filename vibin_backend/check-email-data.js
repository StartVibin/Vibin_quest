const mongoose = require('mongoose')
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin')

// User Schema (simplified for checking)
const userSchema = new mongoose.Schema({
  walletAddress: String,
  email: String,
  emailConnected: Boolean
})

const User = mongoose.model('User', userSchema)

async function checkEmailData() {
  try {
    console.log('Checking email data in database...')
    
    // Wait for connection to be ready
    await mongoose.connection.asPromise()
    
    // Get all users with email data
    const users = await User.find({})
    
    console.log(`Total users: ${users.length}`)
    
    // Check email field values
    const emailStats = {
      null: 0,
      emptyString: 0,
      hasValue: 0,
      emailConnected: 0
    }
    
    users.forEach(user => {
      if (user.email === null) {
        emailStats.null++
      } else if (user.email === '' || user.email === undefined) {
        emailStats.emptyString++
      } else {
        emailStats.hasValue++
      }
      
      if (user.emailConnected) {
        emailStats.emailConnected++
      }
    })
    
    console.log('\n📊 Email Data Statistics:')
    console.log(`  Null values: ${emailStats.null}`)
    console.log(`  Empty strings: ${emailStats.emptyString}`)
    console.log(`  Has value: ${emailStats.hasValue}`)
    console.log(`  Email connected: ${emailStats.emailConnected}`)
    
    // Show some examples
    console.log('\n📋 Sample users with email data:')
    const usersWithEmail = users.filter(u => u.email && u.email !== '')
    usersWithEmail.slice(0, 5).forEach(user => {
      console.log(`  ${user.walletAddress}: email="${user.email}", connected=${user.emailConnected}`)
    })
    
    // Check for potential issues
    console.log('\n🔍 Potential Issues:')
    
    // Check for duplicate emails
    const emailMap = new Map()
    usersWithEmail.forEach(user => {
      if (emailMap.has(user.email)) {
        console.log(`  ⚠️  Duplicate email: ${user.email} used by wallets: ${emailMap.get(user.email)}, ${user.walletAddress}`)
      } else {
        emailMap.set(user.email, user.walletAddress)
      }
    })
    
    // Check for users with emailConnected=true but no email
    const connectedNoEmail = users.filter(u => u.emailConnected && (!u.email || u.email === ''))
    if (connectedNoEmail.length > 0) {
      console.log(`  ⚠️  ${connectedNoEmail.length} users have emailConnected=true but no email value`)
    }
    
    // Check for users with email but emailConnected=false
    const emailNoConnected = users.filter(u => u.email && u.email !== '' && !u.emailConnected)
    if (emailNoConnected.length > 0) {
      console.log(`  ⚠️  ${emailNoConnected.length} users have email but emailConnected=false`)
    }
    
  } catch (error) {
    console.error('❌ Error checking email data:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\nCheck completed.')
  }
}

// Run the check
checkEmailData() 