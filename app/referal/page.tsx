"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";

export default function ReferralPage() {
  return (
    <AuthGuard requireFullAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Referral Program</h1>
            <p className="text-xl mb-8">Invite friends and earn rewards together</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-2xl mx-auto">
              <p className="text-lg mb-4">Referral functionality coming soon!</p>
              <p className="text-sm opacity-80">
                You`&apos;`ll be able to invite friends using your referral code and earn rewards when they join and complete tasks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
