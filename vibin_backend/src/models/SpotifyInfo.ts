import mongoose, { Document, Schema } from 'mongoose'

export interface ISpotifyInfo extends Document {
  operation: string
  spotifyEmail: string
  walletAddress?: string
  invitationCode?: string
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
  createdAt: Date
  updatedAt: Date
  claimDate: Date
  volumeScore?: number
  volumeScoreAtClaim?: number
  diversityScore?: number
  diversityScoreAtClaim?: number
  historyScore?: number
  historyScoreAtClaim?: number
  referralScore?: number
  referralScoreAtClaim?: number
  totalBasePoints?: number
  totalBasePointsAtClaim?: number
  referralCode?: string
  tracksPlayedCount?: number
  uniqueArtistCount?: number
  listeningTime?: number
  anonymousTracksPlayedCount?: number
  playedDays?: number
  referralCount?: number
  point?: number
  pointAtClaim?: number
  invitedUsers?: string[]
}

const spotifyInfoSchema = new Schema<ISpotifyInfo>(
  {
    operation: {
      type: String,
      
      enum: ['store', 'update', 'delete', 'get']
    },
    walletAddress: {
      type: String,
      
      index: true
    },
    spotifyEmail: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },
    invitationCode: {
      type: String,
      trim: true
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    expiresIn: {
      type: Number,
      default:1000000000000000000
    },
    volumeScore: {
      type: Number,
      default: 0
    },
    volumeScoreAtClaim: {
      type: Number,
      default: 0
    },
    diversityScore: {
      type: Number,
      default: 0
    },
    diversityScoreAtClaim: {
      type: Number,
      default: 0
    },
    historyScore: {
      type: Number,
      default: 0
    },
    historyScoreAtClaim: {
      type: Number,
      default: 0
    },
    referralScore: {
      type: Number,
      default: 0
    },
    referralScoreAtClaim: {
      type: Number,
      default: 0
    },
    totalBasePoints: {
      type: Number,
      default: 0
    },
    totalBasePointsAtClaim: {
      type: Number,
      default: 0
    },
    referralCode: {
      type: String,
      default: ''
    },
    tracksPlayedCount: {
      type: Number,
      default: 0
    },
    uniqueArtistCount: {
      type: Number,
      default: 0
    },
    listeningTime: {
      type: Number,
      default: 0 // ms
    },
    anonymousTracksPlayedCount: {
      type: Number,
      default: 0
    },
    playedDays: {
      type: Number,
      default: 0
    },
    referralCount: {
      type: Number,
      default: 0
    },
    point: {
      type: Number,
      default: 0
    },
    pointAtClaim: {
      type: Number,
      default: 0
    },
    invitedUsers: {
      type: [String],
      default: []
    },
    claimDate: {
      type: Date,
      required: true,
      default: Date.now()
    }
  },
  {
    timestamps: true
  }
)

// Static method to find by spotify email
spotifyInfoSchema.statics.findBySpotifyEmail = function(spotifyEmail: string) {
  return this.findOne({ spotifyEmail: spotifyEmail.toLowerCase() })
}

// Static method to find by invitation code
spotifyInfoSchema.statics.findByInvitationCode = function(invitationCode: string) {
  return this.findOne({ invitationCode: invitationCode.trim() })
}

interface ISpotifyInfoModel extends mongoose.Model<ISpotifyInfo> {
  findBySpotifyEmail(spotifyEmail: string): Promise<ISpotifyInfo | null>
  findByInvitationCode(invitationCode: string): Promise<ISpotifyInfo | null>
}

const SpotifyInfo = mongoose.model<ISpotifyInfo, ISpotifyInfoModel>('SpotifyInfo', spotifyInfoSchema, 'spotifyInfos')

export default SpotifyInfo 