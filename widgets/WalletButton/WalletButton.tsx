"use client";

import React from "react";
import { Wallet } from "@/shared/icons";
import styles from "./index.module.css";
import { authenticateWallet } from '@/lib/api';
import { Connector, useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { useRouter } from "next/router";
import { useSharedContext } from "@/provider/SharedContext";

function truncateAddress(address?: string) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

interface WalletButtonProps {
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
}

const WalletButton: React.FC<WalletButtonProps> = ({
    onClick,
    className = "",
    children = "Connect Wallet"
}) => {
    // All hooks at the top level
    const [mounted, setMounted] = React.useState(false);
    const { connectors, connect, status } = useConnect();
    const { disconnect } = useDisconnect();
    const { isConnected, address } = useAccount();
    const { signMessageAsync, isPending: isSigning } = useSignMessage();
    const { sharedValue, setSharedValue } = useSharedContext()
    const { showWallet } = sharedValue;

    React.useEffect(() => setMounted(true), []);

    React.useEffect(() => {
        const handleWelcomeSign = async () => {
            if (isConnected && address) {
                try {
                    const welcomeMessage = "Welcome to Social Quest!";
                    const signature = await signMessageAsync({ message: welcomeMessage });

                    // Check for pending referral code
                    const pendingReferralCode = sessionStorage.getItem('pendingReferralCode');

                    const authData = await authenticateWallet(address, welcomeMessage, signature, pendingReferralCode || undefined);
                    //console.log('Authentication response:', authData);
                    if (authData.success) {
                        //console.log('Wallet authenticated successfully');

                        // Clear the pending referral code after successful authentication
                        if (pendingReferralCode) {
                            sessionStorage.removeItem('pendingReferralCode');
                            //console.log('Referral code applied during registration');
                        }
                    } else {
                        //console.error('Wallet authentication failed:', authData.message);
                    }
                    //console.log('Welcome message signed successfully:', signature);
                } catch (error) {
                    //console.error('Failed to sign welcome message or authenticate:', error);
                }
            }
        };
        handleWelcomeSign();
    }, [isConnected, address, signMessageAsync]);

    // Only control rendering, not hook calls
    if (!mounted) return null;

    if (isConnected) {
        return (
            <button
                className={`${styles.walletButton}`}
                onClick={() => disconnect()}
                disabled={isSigning}
            >
                <Wallet />{isSigning ? 'Signing...' : truncateAddress(address)}
            </button>
        );
    }
    return (
        <WalletOption
            key={connectors[0].uid}
            connector={connectors[0]}
            onClick={() => {
                if (status === 'pending') connect({ connector: connectors[0] })
                else location.href = "/join"
            }}
            isConnecting={status === 'pending'}
            isShowWallet={showWallet}
        />
    );
};

function WalletOption({
    connector,
    onClick,
    isConnecting,
    isShowWallet
}: {
    connector: Connector;
    onClick: () => void;
    isConnecting: boolean;
    isShowWallet: boolean
}) {
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            const provider = await connector.getProvider();
            setReady(!!provider);
        })();
    }, [connector]);

    return (
        <>
            {isShowWallet ?
                <button
                    className={`${styles.walletButton}`}
                    disabled={!ready || isConnecting}
                    onClick={onClick}
                >
                    <Wallet /> {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
                : <></>
            }
        </>
    );
}

export default WalletButton; 