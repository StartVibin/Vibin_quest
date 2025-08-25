"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
// Load environment variables
dotenv.config();
// Simple console logging
const log = (message) => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        const dbName = process.env.MONGODB_DB_NAME || 'beatwise';
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not set');
        }
        const conn = await mongoose.connect(mongoUri, {
            dbName: dbName,
        });
        log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        log(`Error connecting to MongoDB: ${error}`);
        process.exit(1);
    }
};
const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        log('MongoDB connection closed');
    }
    catch (error) {
        log(`Error closing MongoDB connection: ${error}`);
    }
};
// Define EmailList schema inline to avoid import issues
const emailListSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    index: {
        type: Number,
        required: true,
        index: true
    }
}, {
    timestamps: true
});
const EmailList = mongoose.model('EmailList', emailListSchema);
const readEmailsFromFile = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const emails = content
            .split('\n')
            .map(email => email.trim())
            .filter(email => email && email.includes('@'));
        log(`Read ${emails.length} valid emails from file`);
        return emails;
    }
    catch (error) {
        log(`Error reading file ${filePath}: ${error}`);
        throw error;
    }
};
const addEmailsWithIndex = async (emails, clearExisting = false) => {
    try {
        log('Starting to add emails with indexes...');
        if (clearExisting) {
            await EmailList.deleteMany({});
            log('Cleared existing email list');
        }
        const batchSize = 25;
        const totalEmails = emails.length;
        for (let i = 0; i < totalEmails; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            const index = Math.floor(i / batchSize);
            log(`Processing batch ${index + 1}: emails ${i + 1}-${Math.min(i + batchSize, totalEmails)} with index ${index}`);
            const emailDocuments = batch.map(email => ({
                email: email.toLowerCase().trim(),
                index: index
            }));
            const result = await EmailList.insertMany(emailDocuments, { ordered: false });
            log(`Successfully added ${result.length} emails with index ${index}`);
        }
        const totalAdded = await EmailList.countDocuments();
        log(`Total emails in database: ${totalAdded}`);
        const distribution = await EmailList.aggregate([
            { $group: { _id: '$index', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        log('Index distribution:');
        distribution.forEach(item => {
            log(`Index ${item._id}: ${item.count} emails`);
        });
    }
    catch (error) {
        log(`Error adding emails: ${error}`);
        throw error;
    }
};
const main = async () => {
    try {
        const args = process.argv.slice(2);
        const filePath = args[0];
        const clearExisting = args.includes('--clear');
        if (!filePath) {
            log('Usage: node add-emails-simple.js <email-file-path> [--clear]');
            log('Example: node add-emails-simple.js sample-emails.txt --clear');
            process.exit(1);
        }
        if (!fs.existsSync(filePath)) {
            log(`File not found: ${filePath}`);
            process.exit(1);
        }
        await connectDB();
        const emails = readEmailsFromFile(filePath);
        if (emails.length === 0) {
            log('No valid emails found in file');
            return;
        }
        await addEmailsWithIndex(emails, clearExisting);
        log('Script completed successfully!');
    }
    catch (error) {
        log(`Script failed: ${error}`);
        process.exit(1);
    }
    finally {
        await disconnectDB();
        process.exit(0);
    }
};
if (require.main === module) {
    main();
}
