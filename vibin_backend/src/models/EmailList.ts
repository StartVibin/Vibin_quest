import mongoose, { Document, Schema } from 'mongoose'

export interface IEmailList extends Document {
  email: string
  index: number
  createdAt: Date
  updatedAt: Date
}

const emailListSchema = new Schema<IEmailList>(
  {
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
  },
  {
    timestamps: true
  }
)

// Compound index for efficient queries
emailListSchema.index({ index: 1, email: 1 })

const EmailList = mongoose.model<IEmailList>('EmailList', emailListSchema)

export default EmailList 