import mongoose from 'mongoose'
import { config } from './src/config/environment'
import { EmailList } from './src/models'
import logger from './src/utils/logger'

// Sample email list - replace with your actual emails
const EMAILS = [
  'user1@example.com',
  'user2@example.com',
  'user3@example.com',
  'user4@example.com',
  'user5@example.com',
  'user6@example.com',
  'user7@example.com',
  'user8@example.com',
  'user9@example.com',
  'user10@example.com',
  'user11@example.com',
  'user12@example.com',
  'user13@example.com',
  'user14@example.com',
  'user15@example.com',
  'user16@example.com',
  'user17@example.com',
  'user18@example.com',
  'user19@example.com',
  'user20@example.com',
  'user21@example.com',
  'user22@example.com',
  'user23@example.com',
  'user24@example.com',
  'user25@example.com',
  'user26@example.com',
  'user27@example.com',
  'user28@example.com',
  'user29@example.com',
  'user30@example.com',
  'user31@example.com',
  'user32@example.com',
  'user33@example.com',
  'user34@example.com',
  'user35@example.com',
  'user36@example.com',
  'user37@example.com',
  'user38@example.com',
  'user39@example.com',
  'user40@example.com',
  'user41@example.com',
  'user42@example.com',
  'user43@example.com',
  'user44@example.com',
  'user45@example.com',
  'user46@example.com',
  'user47@example.com',
  'user48@example.com',
  'user49@example.com',
  'user50@example.com',
  // Add more emails as needed...
]

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI!, {
      dbName: config.MONGODB_DB_NAME,
    })
    logger.info(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error)
    process.exit(1)
  }
}

const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close()
    logger.info('MongoDB connection closed')
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error)
  }
}

const addEmailsWithIndex = async (): Promise<void> => {
  try {
    logger.info('Starting to add emails with indexes...')
    
    // Clear existing email list (optional - remove this if you want to append)
    await EmailList.deleteMany({})
    logger.info('Cleared existing email list')
    
    const batchSize = 25
    const totalEmails = EMAILS.length
    
    for (let i = 0; i < totalEmails; i += batchSize) {
      const batch = EMAILS.slice(i, i + batchSize)
      const index = Math.floor(i / batchSize)
      
      logger.info(`Processing batch ${index + 1}: emails ${i + 1}-${Math.min(i + batchSize, totalEmails)} with index ${index}`)
      
      const emailDocuments = batch.map(email => ({
        email: email.toLowerCase().trim(),
        index: index
      }))
      
      // Insert batch
      const result = await EmailList.insertMany(emailDocuments, { ordered: false })
      logger.info(`Successfully added ${result.length} emails with index ${index}`)
    }
    
    // Verify the results
    const totalAdded = await EmailList.countDocuments()
    logger.info(`Total emails added: ${totalAdded}`)
    
    // Show distribution by index
    const distribution = await EmailList.aggregate([
      { $group: { _id: '$index', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
    
    logger.info('Index distribution:')
    distribution.forEach(item => {
      logger.info(`Index ${item._id}: ${item.count} emails`)
    })
    
  } catch (error) {
    logger.error('Error adding emails:', error)
    throw error
  }
}

const main = async (): Promise<void> => {
  try {
    await connectDB()
    await addEmailsWithIndex()
    logger.info('Script completed successfully!')
  } catch (error) {
    logger.error('Script failed:', error)
    process.exit(1)
  } finally {
    await disconnectDB()
    process.exit(0)
  }
}

// Run the script
if (require.main === module) {
  main()
}

export { addEmailsWithIndex } 