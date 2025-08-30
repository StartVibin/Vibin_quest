# Email Index Scripts

This collection of scripts allows you to add emails to the database with an automatic indexing system. Every 25 emails get the same index, and the index increments by 1 for each group.

## Index System

- **Index 0**: Emails 1-25
- **Index 1**: Emails 26-50  
- **Index 2**: Emails 51-75
- **Index 3**: Emails 76-100
- And so on...

## Prerequisites

1. Make sure your MongoDB connection is properly configured in your `.env` file
2. Install dependencies: `npm install`
3. Ensure TypeScript is available: `npm install -g typescript ts-node`

## Scripts Overview

### 1. `add-emails-with-index.ts` - Basic Script
A simple script with hardcoded emails for testing purposes.

**Usage:**
```bash
ts-node add-emails-with-index.ts
```

**Features:**
- Uses predefined email list
- Clears existing email data
- Shows index distribution after completion

### 2. `add-emails-from-file.ts` - File-based Script
Reads emails from a text file and adds them to the database.

**Usage:**
```bash
# Add emails without clearing existing data
ts-node add-emails-from-file.ts emails.txt

# Clear existing data and add new emails
ts-node add-emails-from-file.ts emails.txt --clear
```

**Features:**
- Reads emails from text file (one email per line)
- Optional clearing of existing data
- Validates email format (must contain '@')
- Shows progress and results

### 3. `add-emails-incrementally.ts` - Incremental Addition
Adds new emails to existing data without clearing previous entries.

**Usage:**
```bash
ts-node add-emails-incrementally.ts new-emails.txt
```

**Features:**
- Automatically calculates next available index
- Preserves existing email data
- Smart index calculation based on current database state

## Email File Format

Create a text file with one email per line:

```txt
user1@example.com
user2@example.com
user3@example.com
...
```

## Database Schema

The emails are stored in a new `EmailList` collection with the following structure:

```typescript
interface IEmailList {
  email: string;      // The email address (unique, lowercase)
  index: number;      // The group index (0, 1, 2, ...)
  createdAt: Date;    // Creation timestamp
  updatedAt: Date;    // Last update timestamp
}
```

## Examples

### Example 1: Initial Setup
```bash
# Clear database and add first batch of emails
ts-node add-emails-from-file.ts initial-emails.txt --clear
```

### Example 2: Add More Emails
```bash
# Add more emails without clearing existing data
ts-node add-emails-incrementally.ts additional-emails.txt
```

### Example 3: Replace All Emails
```bash
# Clear and replace all emails
ts-node add-emails-from-file.ts new-email-list.txt --clear
```

## Output Example

When running the scripts, you'll see output like:

```
MongoDB Connected: localhost
Starting to add emails with indexes...
Processing batch 1: emails 1-25 with index 0
Successfully added 25 emails with index 0
Processing batch 2: emails 26-50 with index 1
Successfully added 25 emails with index 1
Total emails in database: 50
Index distribution:
Index 0: 25 emails
Index 1: 25 emails
Script completed successfully!
MongoDB connection closed
```

## Error Handling

The scripts include comprehensive error handling:
- Database connection failures
- File reading errors
- Invalid email formats
- Database operation failures

## Performance

- Emails are processed in batches of 25 for optimal performance
- Uses MongoDB's `insertMany` for efficient bulk operations
- Includes progress logging for large email lists

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your `.env` file for `MONGODB_URI`
   - Ensure MongoDB is running
   - Verify network connectivity

2. **File Not Found**
   - Check the file path
   - Ensure the file exists in the specified location

3. **Permission Denied**
   - Ensure you have read permissions for the email file
   - Check database write permissions

### Debug Mode

For additional debugging, you can modify the scripts to include more verbose logging by updating the logger configuration.

## Customization

You can easily modify the scripts to:
- Change the batch size (currently 25)
- Add additional validation rules
- Modify the index calculation logic
- Add custom email processing

## Support

If you encounter issues:
1. Check the error messages in the console
2. Verify your MongoDB connection
3. Ensure your email file format is correct
4. Check that all required dependencies are installed 