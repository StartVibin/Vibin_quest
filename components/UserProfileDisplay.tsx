import React from 'react'
import { useUserProfile } from '@/lib/hooks/useUserProfile'

export const UserProfileDisplay: React.FC = () => {
  const { profile, loading, error, refetch } = useUserProfile()

  if (loading && !profile) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold">Error Loading Profile</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={refetch}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Connect your wallet to view profile</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Auto-refresh every 3s</span>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${profile.xConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${profile.xConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">X Connected</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${profile.telegramConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${profile.telegramConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">Telegram Connected</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${profile.emailConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${profile.emailConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">Email Connected</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${profile.telegramJoinedGroup ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${profile.telegramJoinedGroup ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">Group Joined</span>
          </div>
        </div>
      </div>

      {/* Social Tasks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${profile.xFollowed ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} border`}>
          <span className="text-sm font-medium">X Followed</span>
          <div className="text-xs text-gray-500">{profile.xFollowed ? '✅ Completed' : '⏳ Pending'}</div>
        </div>
        
        <div className={`p-3 rounded-lg ${profile.xReplied ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} border`}>
          <span className="text-sm font-medium">X Replied</span>
          <div className="text-xs text-gray-500">{profile.xReplied ? '✅ Completed' : '⏳ Pending'}</div>
        </div>
        
        <div className={`p-3 rounded-lg ${profile.xReposted ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} border`}>
          <span className="text-sm font-medium">X Reposted</span>
          <div className="text-xs text-gray-500">{profile.xReposted ? '✅ Completed' : '⏳ Pending'}</div>
        </div>
        
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <span className="text-sm font-medium">Invite Code</span>
          <div className="text-xs text-gray-500 font-mono">{profile.inviteCode || 'Not generated'}</div>
        </div>
      </div>

      {/* Points */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <span className="text-sm font-medium text-yellow-800">Game Points</span>
          <div className="text-lg font-bold text-yellow-900">{profile.gamePoints}</div>
        </div>
        
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
          <span className="text-sm font-medium text-purple-800">Referral Points</span>
          <div className="text-lg font-bold text-purple-900">{profile.referralPoints}</div>
        </div>
        
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <span className="text-sm font-medium text-green-800">Social Points</span>
          <div className="text-lg font-bold text-green-900">{profile.socialPoints}</div>
        </div>
        
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <span className="text-sm font-medium text-blue-800">Total Points</span>
          <div className="text-lg font-bold text-blue-900">{profile.totalPoints}</div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <span className="text-sm font-medium">High Score</span>
          <div className="text-lg font-bold">{profile.highScore}</div>
        </div>
        
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
          <span className="text-sm font-medium">Wallet Address</span>
          <div className="text-xs font-mono text-gray-600 truncate">{profile.walletAddress}</div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Last updated: {new Date(profile.updatedAt).toLocaleTimeString()}</span>
          <button 
            onClick={refetch}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
          >
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  )
} 