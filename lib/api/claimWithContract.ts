import axios from "axios";

import { ethers } from "ethers"
import { toast } from 'react-toastify';
type EthAddress = `0x${string}`;

interface ClaimData {
    amount: string;
    nonce: number;
    deadline: number;
    signature: string;
}

const CLAIM_CONTRACT_ABI = [
  "function claimTokens(uint256 totalAmount, uint256 nonce, uint256 deadline, bytes memory signature) external",
];
export const claimWithContract = async (publicKey: EthAddress | undefined, contractAddress: string,
  signer: ethers.Signer,) => {
    let toastId;
    const inviteCode = localStorage.getItem('inviteCode');
    try {
        const data = {
            publicKey,
            inviteCode
        };
        console.log("🚀 ~ claim ~ data.publicKey:", data.publicKey)
        toastId = toast.loading("Waiting");
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL!}/api/v1/spotify/claim`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    // Add any authentication headers if needed
                    // 'Authorization': 'Bearer your-token'
                },
            }
        );
        console.log(response.data.claimData);
        const claimResult = await claimVestingTokens(
            publicKey,
            response.data.claimData,
            contractAddress,
            signer,

        );

       
        toast.dismiss(toastId);
        toast.success("Success");
         return claimResult;
    } catch (err) {
        console.log("🚀 ~ claim ~ toastId:", toastId)

        toast.dismiss(toastId);
        console.error("Error:", err);
        toast.error("Can't claim");
    }

};

export const claimVestingTokens = async (
    address: `0x${string}` | undefined,
    claimData: ClaimData,
    contractAddress: string,
    signer: ethers.Signer,

): Promise<{ success: boolean; txHash?: string; error?: string; amount?: string }> => {
    
    try {
        console.log("provider================", signer.provider);
        console.log("signer=====", signer);
        console.log("🔄 Claiming vesting tokens...");
        console.log("📋 Claim data:", claimData);
        const provider = signer.provider;
        console.log("🚀 ~ provider:", provider)
        // Create contract instance
        const contract = new ethers.Contract(contractAddress, CLAIM_CONTRACT_ABI, signer);

        // Get user address
        const userAddress = address;
        console.log("👤 User address:", userAddress);

        // Optional: Verify signature before claiming
        // try {
        //     const isValidSignature = await contract.verifySignature(
        //         userAddress,
        //         claimData.totalAmount,
        //         claimData.nonce,
        //         claimData.deadline,
        //         claimData.signature
        //     );

        //     console.log("🔍 Signature verification:", isValidSignature);

        //     if (!isValidSignature) {
        //         throw new Error("Invalid signature from backend");
        //     }
        // } catch (verifyError) {
        //     console.warn("⚠️ Could not verify signature:", verifyError);
        //     // Continue anyway - let the contract handle verification
        // }

        // // Check claimable amount BEFORE claiming
        // try {
        //     // const [claimableNow, totalClaimed, totalAvailable] = await contract.getClaimableAmount(
        //     //     userAddress,
        //     //     claimData.totalAmount,
        //     //     claimData.nonce,
        //     //     claimData.deadline
        //     // );

        //     // const claimableInfo: ClaimableAmountInfo = {
        //     //     claimableNow: ethers.formatEther(claimableNow),
        //     //     totalClaimed: ethers.formatEther(totalClaimed),
        //     //     totalAvailable: ethers.formatEther(totalAvailable)
        //     // };

        //     // console.log("📊 Claimable info BEFORE claiming:");
        //     // console.log("   Available now:", claimableInfo.claimableNow);
        //     // console.log("   Total claimed:", claimableInfo.totalClaimed);
        //     // console.log("   Total available:", claimableInfo.totalAvailable);

        //     // // Call the callback with BEFORE claim info
        //     // if (onClaimInfoUpdate) {
        //     //     onClaimInfoUpdate(claimableInfo);
        //     // }

        //     // if (claimableNow.toString() === "0") {
        //     //     throw new Error("No tokens available to claim at this time");
        //     // }
        // } catch (infoError) {
        //     console.warn("⚠️ Could not get claim info:", infoError);
        //     // Continue anyway
        // }

        // Execute claim transaction
        console.log("🚀 Executing claim transaction...");

        const tx = await contract.claimTokens(
            claimData.amount,
            claimData.nonce,
            claimData.deadline,
            claimData.signature
        );

        console.log("📤 Transaction sent:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed:", receipt.transactionHash);

        // Get updated claimable amount AFTER claiming
        // const [claimableNowAfter, totalClaimedAfter, totalAvailableAfter] = await contract.getClaimableAmount(
        //     userAddress,
        //     claimData.amount,
        //     claimData.nonce,
        //     claimData.deadline
        // );

        // amount = ethers.formatEther(claimableNowAfter);

        // const updatedClaimableInfo: ClaimableAmountInfo = {
        //     claimableNow: ethers.formatEther(claimableNowAfter),
        //     totalClaimed: ethers.formatEther(totalClaimedAfter),
        //     totalAvailable: ethers.formatEther(totalAvailableAfter)
        // };

        // console.log("📊 Updated claimable info AFTER claiming:");
        // console.log("   Available now:", updatedClaimableInfo.claimableNow);
        // console.log("   Total claimed:", updatedClaimableInfo.totalClaimed);
        // console.log("   Total available:", updatedClaimableInfo.totalAvailable);



        return {
            success: true,
            txHash: receipt.transactionHash,
            
        };

    } catch (error) {
        console.error("❌ Error claiming tokens:", error);

        // Parse common error messages
        // let errorMessage = error.message;
        // if (error.message.includes("Vesting has not started yet")) {
        //   errorMessage = "Vesting period has not started yet";
        // } else if (error.message.includes("No tokens available to claim")) {
        //   errorMessage = "No tokens available to claim at this time";
        // } else if (error.message.includes("Invalid signature")) {
        //   errorMessage = "Invalid authorization signature";
        // } else if (error.message.includes("Signature expired")) {
        //   errorMessage = "Authorization signature has expired";
        // }

        return {
            success: false,
            error: "Error",
            
        };
    }
};