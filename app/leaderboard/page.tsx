"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";
import { Leaderboard } from "@/components/Leaderboard";

export default function LeaderboardPage() {
  return (
    <AuthGuard requireFullAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
            <p className="text-xl">Top Vibin users and their scores</p>
          </div>
          <Leaderboard />
        </div>
      </div>
    </AuthGuard>
  );
}
