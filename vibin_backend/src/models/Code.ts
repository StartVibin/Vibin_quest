import mongoose, { Document, Schema } from 'mongoose'

export interface ICode extends Document {
  walletAddress: string
  referralCode: string
  totalPoints: number
  rank: number
  createdAt: Date
}

const codeSchema = new Schema<ICode>(
  {
    walletAddress: {
      type: String,
      
      trim: true,
      lowercase: true,
      index: true
    },
    referralCode: {
      type: String,
      
     
      trim: true,
      index: true
    },
    totalPoints: {
      type: Number,
      
      default: 0
    },
    rank: {
      type: Number,
      required: true,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false // We don't want updatedAt since this is static data
  }
)

// Static method to find by referral code
codeSchema.statics.findByReferralCode = function(referralCode: string) {
  return this.findOne({ referralCode: referralCode.trim() })
}

interface ICodeModel extends mongoose.Model<ICode> {
  findByReferralCode(referralCode: string): Promise<ICode | null>
}

const Code = mongoose.model<ICode, ICodeModel>('Code', codeSchema, 'codes')

export default Code 