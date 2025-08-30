const mongoose = require('mongoose')
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startvibin')

// User Schema (simplified for checking)
const userSchema = new mongoose.Schema({
  walletAddress: String,
  invitedBy: String,
  inviteCode: String,
  referralPoints: Number,
  xConnected: Boolean,
  xId: String,
  telegramConnected: Boolean,
  telegramId: String,
  emailConnected: Boolean,
  email: String
})

const User = mongoose.model('User', userSchema)

async function checkReferralStatus() {
  try {
    console.log('Checking referral status...')
    
    // Wait for connection to be ready
    await mongoose.connection.asPromise()
    
    // Get all users with referral relationships
    const usersWithReferrals = await User.find({
      $or: [
        { invitedBy: { $exists: true, $ne: '' } },
        { inviteCode: { $exists: true, $ne: '' } }
      ]
    })
    
    console.log(`Found ${usersWithReferrals.length} users with referral relationships`)
    
    // Check each user's status
    for (const user of usersWithReferrals) {
      console.log(`\n📋 User: ${user.walletAddress}`)
      console.log(`  Invited by: ${user.invitedBy || 'None'}`)
      console.log(`  Invite code: ${user.inviteCode || 'None'}`)
      console.log(`  Current referral points: ${user.referralPoints}`)
      
      // Check social connections
      const socialConnections = {
        xConnected: user.xConnected && user.xId && user.xId.trim() !== '',
        telegramConnected: user.telegramConnected && user.telegramId && user.telegramId.trim() !== '',
        emailConnected: user.emailConnected && user.email && user.email.trim() !== ''
      }
      
      const connectedCount = Object.values(socialConnections).filter(Boolean).length
      
      console.log(`  Social connections:`)
      console.log(`    X: ${socialConnections.xConnected ? '✅' : '❌'} ${user.xId || 'Not connected'}`)
      console.log(`    Telegram: ${socialConnections.telegramConnected ? '✅' : '❌'} ${user.telegramId || 'Not connected'}`)
      console.log(`    Email: ${socialConnections.emailConnected ? '✅' : '❌'} ${user.email || 'Not connected'}`)
      console.log(`    Connected count: ${connectedCount}/3`)
      
      // Check eligibility
      const isEligible = connectedCount >= 3 && user.invitedBy && user.inviteCode
      const hasReceivedPoints = user.referralPoints > 0
      
      console.log(`  Eligibility: ${isEligible ? '✅ Eligible' : '❌ Not eligible'}`)
      console.log(`  Points received: ${hasReceivedPoints ? '✅ Yes' : '❌ No'}`)
      
      if (isEligible && !hasReceivedPoints) {
        console.log(`  🎯 ACTION NEEDED: Call POST /api/referrals/verify/${user.walletAddress}`)
      }
    }
    
    // Check inviters
    console.log('\n🔍 Checking inviters...')
    const inviters = await User.find({
      invitedUsers: { $exists: true, $ne: [] }
    })
    
    for (const inviter of inviters) {
      console.log(`\n📋 Inviter: ${inviter.walletAddress}`)
      console.log(`  Total invited users: ${inviter.invitedUsers.length}`)
      console.log(`  Referral points: ${inviter.referralPoints}`)
      
      // Check each invited user
      for (const invitedWallet of inviter.invitedUsers) {
        const invitedUser = await User.findOne({ walletAddress: invitedWallet })
        if (invitedUser) {
          const socialConnections = {
            xConnected: invitedUser.xConnected && invitedUser.xId && invitedUser.xId.trim() !== '',
            telegramConnected: invitedUser.telegramConnected && invitedUser.telegramId && invitedUser.telegramId.trim() !== '',
            emailConnected: invitedUser.emailConnected && invitedUser.email && invitedUser.email.trim() !== ''
          }
          const connectedCount = Object.values(socialConnections).filter(Boolean).length
          
          console.log(`    Invited: ${invitedWallet}`)
          console.log(`      Socials: ${connectedCount}/3, Points: ${invitedUser.referralPoints}`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking referral status:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\nCheck completed.')
  }
}

// Run the check
checkReferralStatus() 