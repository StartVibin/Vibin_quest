import mongoose from 'mongoose'
import fs from 'fs'
import { config } from './src/config/environment'
import { EmailList } from './src/models'
import logger from './src/utils/logger'

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

const readEmailsFromFile = (filePath: string): string[] => {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const emails = content
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'))
    
    logger.info(`Read ${emails.length} valid emails from file`)
    return emails
  } catch (error) {
    logger.error(`Error reading file ${filePath}:`, error)
    throw error
  }
}

const getNextIndex = async (): Promise<number> => {
  try {
    // Find the highest index in the database
    const highestIndexDoc = await EmailList.findOne().sort({ index: -1 })
    
    if (!highestIndexDoc) {
      // No emails in database, start with index 0
      return 0
    }
    
    // Count emails with the highest index
    const countWithHighestIndex = await EmailList.countDocuments({ 
      index: highestIndexDoc.index 
    })
    
    // If the highest index has 25 emails, start a new index
    if (countWithHighestIndex >= 25) {
      return highestIndexDoc.index + 1
    }
    
    // Otherwise, use the current highest index
    return highestIndexDoc.index
  } catch (error) {
    logger.error('Error getting next index:', error)
    throw error
  }
}

const addEmailsIncrementally = async (emails: string[]): Promise<void> => {
  try {
    logger.info('Starting to add emails incrementally...')
    
    const batchSize = 25
    const totalEmails = emails.length
    let currentIndex = await getNextIndex()
    
    logger.info(`Starting with index: ${currentIndex}`)
    
    for (let i = 0; i < totalEmails; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      
      logger.info(`Processing batch: emails ${i + 1}-${Math.min(i + batchSize, totalEmails)} with index ${currentIndex}`)
      
      const emailDocuments = batch.map(email => ({
        email: email.toLowerCase().trim(),
        index: currentIndex
      }))
      
      // Insert batch
      const result = await EmailList.insertMany(emailDocuments, { ordered: false })
      logger.info(`Successfully added ${result.length} emails with index ${currentIndex}`)
      
      // Move to next index for next batch
      currentIndex++
    }
    
    // Verify the results
    const totalAdded = await EmailList.countDocuments()
    logger.info(`Total emails in database: ${totalAdded}`)
    
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
    const args = process.argv.slice(2)
    const filePath = args[0]
    
    if (!filePath) {
      logger.error('Usage: ts-node add-emails-incrementally.ts <email-file-path>')
      logger.error('Example: ts-node add-emails-incrementally.ts new-emails.txt')
      process.exit(1)
    }
    
    if (!fs.existsSync(filePath)) {
      logger.error(`File not found: ${filePath}`)
      process.exit(1)
    }
    
    await connectDB()
    
    const emails = readEmailsFromFile(filePath)
    if (emails.length === 0) {
      logger.warn('No valid emails found in file')
      return
    }
    
    await addEmailsIncrementally(emails)
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

export { addEmailsIncrementally, getNextIndex } 