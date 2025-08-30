// Test script to manually trigger referral score calculation
// This can be run to test the new logging system

const API_BASE_URL = 'https://api.startvibin.io'; // Update this to your actual API URL

async function testReferralCalculation() {
  console.log('🧪 Testing Referral Score Calculation Endpoint\n');
  
  try {
    console.log('📡 Calling calculate referral scores endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/referrals/calculate-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    console.log('✅ Response received:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n🎯 Calculation completed successfully!');
      console.log(`📊 Users updated: ${data.data.updatedCount}`);
      console.log(`📊 Total users processed: ${data.data.totalUsersProcessed}`);
      console.log(`💰 Total referral points calculated: ${data.data.totalReferralPointsCalculated}`);
    } else {
      console.log('\n❌ Calculation failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error);
  }
}

async function testGetUserReferralInfo(email) {
  console.log(`\n🧪 Testing Get User Referral Info for: ${email}\n`);
  
  try {
    console.log('📡 Calling getUserReferralInfo endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/referrals/user/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    console.log('✅ Response received:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n👤 User referral info retrieved successfully!');
      console.log(`🔑 Referral Code: ${data.data.referralCode}`);
      console.log(`📊 Referral Score: ${data.data.referralScore}`);
      console.log(`📊 Today's Score: ${data.data.referralScoreToday}`);
      console.log(`👥 Invited Users: ${data.data.invitedUsers.length}`);
      
      if (data.data.invitedUsers.length > 0) {
        console.log('\n📋 Invited Users Details:');
        data.data.invitedUsers.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email}: ${user.points} points (joined: ${user.joinedDate})`);
        });
      }
    } else {
      console.log('\n❌ Failed to get user referral info:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing getUserReferralInfo:', error);
  }
}

// Run tests
console.log('🚀 Starting Referral System Tests...\n');

// Test 1: Calculate all referral scores
testReferralCalculation();

// Test 2: Get specific user referral info (uncomment and update email)
// setTimeout(() => testGetUserReferralInfo('test@example.com'), 2000);

console.log('\n📝 Check your backend logs to see the detailed calculation process!');
console.log('📝 Check your browser console to see frontend API calls!');
