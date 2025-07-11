"use client";

import { LoginButton } from "@telegram-auth/react";
import { useAccount } from "wagmi";
import { toast } from 'react-toastify';
import { showWalletWarning } from "@/lib/utils";

interface TelegramLoginButtonProps {
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function TelegramLoginButton({ 
  onSuccess, 
  className = "", 
  children 
}: TelegramLoginButtonProps) {
  const { address, isConnected } = useAccount();

  const sendToBackend = async (telegramData: any) => {
    try {
      console.log("Sending Telegram data to backend:", telegramData);
      
      if (!isConnected) {
        showWalletWarning(toast);
        return;
      }
      
      // First save Telegram auth data
      const authData = {
        telegramData,
        walletAddress: address
      };
      
      const authResponse = await fetch('http://localhost:5000/api/v1/telegram/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });

      if (authResponse.ok) {
        const authResult = await authResponse.json();
        console.log("Telegram auth response:", authResult);
        
        // Then verify quest completion
        const { verifyTelegramConnection } = await import('@/lib/api');
        const verificationResult = await verifyTelegramConnection(address!, telegramData);
        
        toast.success(`Telegram connected successfully! Awarded ${verificationResult.data.pointsAwarded} points!`);
        onSuccess?.();
      } else {
        console.error("Backend error:", authResponse.status, authResponse.statusText);
        toast.error("Failed to connect Telegram. Please try again.");
      }
    } catch (error) {
      console.error("Error sending to backend:", error);
      toast.error("Failed to connect Telegram. Please try again.");
    }
  };

  return (
    <LoginButton
      botUsername="MyVibinBot" // Replace with your actual bot username
      onAuthCallback={(data) => {
        console.log("Telegram Auth Data:", data);
        sendToBackend(data);
      }}
    />
  );
} 