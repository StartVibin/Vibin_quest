import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
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
    // Split by newlines and filter out empty lines
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

const addEmailsWithIndex = async (emails: string[], clearExisting: boolean = false): Promise<void> => {
  try {
    logger.info('Starting to add emails with indexes...')
    
    if (clearExisting) {
      await EmailList.deleteMany({})
      logger.info('Cleared existing email list')
    }
    
    const batchSize = 25
    const totalEmails = emails.length
    
    for (let i = 0; i < totalEmails; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
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
    // Check command line arguments
    const args = process.argv.slice(2)
    const filePath = args[0]
    const clearExisting = args.includes('--clear')
    
    if (!filePath) {
      logger.error('Usage: ts-node add-emails-from-file.ts <email-file-path> [--clear]')
      logger.error('Example: ts-node add-emails-from-file.ts emails.txt --clear')
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
    
    await addEmailsWithIndex(emails, clearExisting)
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

export { addEmailsWithIndex, readEmailsFromFile } 