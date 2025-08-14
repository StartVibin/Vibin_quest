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
    signer: ethers.Signer, email: string) => {
    let toastId;
    const inviteCode = localStorage.getItem('inviteCode');
    try {
        const data = {
            publicKey,
            inviteCode,
            email
        };
        console.log("🚀 ~ claim ~ data.publicKey:", data.publicKey)
        toastId = toast.loading("Preparing claim...");
        
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
        
        // Update loading message for transaction
        toast.update(toastId, { render: "Executing transaction...", isLoading: true });
        
        const claimResult = await claimVestingTokens(
            publicKey,
            response.data.claimData,
            contractAddress,
            signer,
        );
        
        console.log("claimResult=====================>", claimResult);
        
        // Check if the claim was successful
        if (claimResult.success) {
            toast.dismiss(toastId);
            toast.success(`Success! Tokens claimed successfully. TX: ${claimResult.txHash?.slice(0, 10)}...`);
            return claimResult;
        } else {
            // Transaction failed
            toast.dismiss(toastId);
            toast.error(claimResult.error || "Transaction failed");
            return claimResult;
        }
        
    } catch (err) {
        console.log("🚀 ~ claim ~ toastId:", toastId)

        toast.dismiss(toastId);
        console.error("Error:", err);
        
        // Provide more specific error messages
        let errorMessage = "Can't claim";
        if (err instanceof Error) {
            const errorString = err.message.toLowerCase();
            
            // User action errors
            if (errorString.includes("user rejected") || errorString.includes("user denied") || errorString.includes("user cancelled")) {
                errorMessage = "Claim cancelled by user";
            } else if (errorString.includes("user rejected the request")) {
                errorMessage = "Claim rejected by user";
            }
            // Network and connection errors
            else if (errorString.includes("network") || errorString.includes("connection")) {
                errorMessage = "Network error. Please check your connection";
            } else if (errorString.includes("timeout")) {
                errorMessage = "Request timeout. Please try again";
            } else if (errorString.includes("fetch")) {
                errorMessage = "Network request failed";
            }
            // Contract and transaction errors
            else if (errorString.includes("execution reverted")) {
                errorMessage = "Transaction reverted by smart contract";
            } else if (errorString.includes("out of gas")) {
                errorMessage = "Transaction ran out of gas";
            } else if (errorString.includes("insufficient funds")) {
                errorMessage = "Insufficient funds for gas fees";
            } else if (errorString.includes("gas limit exceeded")) {
                errorMessage = "Gas limit exceeded";
            }
            // API errors
            else if (errorString.includes("unauthorized") || errorString.includes("401")) {
                errorMessage = "Authentication failed. Please reconnect your wallet";
            } else if (errorString.includes("forbidden") || errorString.includes("403")) {
                errorMessage = "Access denied. You may not be eligible to claim";
            } else if (errorString.includes("not found") || errorString.includes("404")) {
                errorMessage = "Claim data not found";
            } else if (errorString.includes("server error") || errorString.includes("500")) {
                errorMessage = "Server error. Please try again later";
            }
            // Generic fallback
            else {
                errorMessage = "Claim failed. Please try again.";
            }
        }
        
        toast.error(errorMessage);
        throw err; // Re-throw the error so the calling code knows it failed
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
        console.log("✅ Transaction confirmed:", receipt);

        // Check if transaction was successful (status 1 = success, 0 = failure)
        if (receipt.status === 0) {
            return {
                success: false,
                error: "Transaction reverted on-chain",
                txHash: receipt.transactionHash,
            };
        }

        // Transaction was successful
        return {
            success: true,
            txHash: receipt.transactionHash,
        };

    } catch (error) {
        console.error("❌ Error claiming tokens:", error);

        // Parse common error messages for better user feedback
        let errorMessage = "Transaction failed";
        
        if (error instanceof Error) {
            const errorString = error.message.toLowerCase();
            
            // User action errors
            if (errorString.includes("user rejected") || errorString.includes("user denied") || errorString.includes("user cancelled")) {
                errorMessage = "Transaction was cancelled by user";
            } else if (errorString.includes("user rejected the request")) {
                errorMessage = "Transaction was rejected by user";
            }
            // Gas and funds errors
            else if (errorString.includes("insufficient funds") || errorString.includes("gas")) {
                errorMessage = "Insufficient funds for gas fees";
            } else if (errorString.includes("out of gas")) {
                errorMessage = "Transaction ran out of gas";
            } else if (errorString.includes("gas limit exceeded")) {
                errorMessage = "Gas limit exceeded";
            }
            // Network errors
            else if (errorString.includes("network") || errorString.includes("connection")) {
                errorMessage = "Network connection error";
            } else if (errorString.includes("timeout")) {
                errorMessage = "Transaction timeout";
            }
            // Transaction errors
            else if (errorString.includes("nonce") || errorString.includes("replacement")) {
                errorMessage = "Transaction nonce error";
            } else if (errorString.includes("execution reverted")) {
                errorMessage = "Transaction reverted by smart contract";
            } else if (errorString.includes("transaction underpriced")) {
                errorMessage = "Gas price too low";
            }
            // Contract-specific errors
            else if (errorString.includes("vesting has not started")) {
                errorMessage = "Vesting period has not started yet";
            } else if (errorString.includes("no tokens available")) {
                errorMessage = "No tokens available to claim at this time";
            } else if (errorString.includes("invalid signature")) {
                errorMessage = "Invalid authorization signature";
            } else if (errorString.includes("signature expired")) {
                errorMessage = "Authorization signature has expired";
            } else if (errorString.includes("already claimed")) {
                errorMessage = "Tokens have already been claimed";
            } else if (errorString.includes("not eligible")) {
                errorMessage = "You are not eligible to claim";
            }
            // Wallet errors
            else if (errorString.includes("wallet not connected")) {
                errorMessage = "Please connect your wallet";
            } else if (errorString.includes("wrong network")) {
                errorMessage = "Please switch to the correct network";
            }
            // Generic fallback
            else {
                // For other errors, use a generic message but log the actual error
                errorMessage = "Transaction failed. Please try again.";
            }
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};