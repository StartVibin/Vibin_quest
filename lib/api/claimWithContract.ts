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
    const inviteCode = localStorage.getItem('invitation_code');
    const email = localStorage.getItem('spotify_email');

    if (!email) {
        toast.error("Email not found. Please reconnect your Spotify account.");
        return;
    }
    
    try {
        const data = {
            publicKey,
            inviteCode,
            email
        };
        
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
        const contract = new ethers.Contract(contractAddress, CLAIM_CONTRACT_ABI, signer);
        const tx = await contract.claimTokens(
            claimData.amount,
            claimData.nonce,
            claimData.deadline,
            claimData.signature
        );

        const receipt = await tx.wait();
        return {
            success: true,
            txHash: receipt.transactionHash,
            
        };

    } catch (error) {
        console.error("❌ Error claiming tokens:", error);
        return {
            success: false,
            error: "Error",
            
        };
    }
};