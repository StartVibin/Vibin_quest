"use client";

import React from "react";
import { Wallet } from "@/shared/icons";
import styles from "./index.module.css";
import { authenticateWallet } from '@/lib/api';
import { Connector, useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';


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
    const { connectors, connect, status } = useConnect();
    const { disconnect } = useDisconnect();
    const { isConnected, address } = useAccount();
    const { signMessageAsync, isPending: isSigning } = useSignMessage();
    React.useEffect(() => {
        const handleWelcomeSign = async () => {
            if (isConnected && address) {
                try {
                    // Automatically sign welcome message when connected
                    const welcomeMessage = "Welcome to Social Quest!";

                    const signature = await signMessageAsync({
                        message: welcomeMessage,
                    });

                    // Call the authentication API with the signed message
                    const authData = await authenticateWallet(
                        address,
                        welcomeMessage,
                        signature
                    );

                    console.log('Authentication response:', authData);

                    if (authData.success) {
                        console.log('Wallet authenticated successfully');
                    } else {
                        console.error('Wallet authentication failed:', authData.message);
                    }

                    console.log('Welcome message signed successfully:', signature);
                    // You can store the signature or send it to your backend here
                } catch (error) {
                    console.error('Failed to sign welcome message or authenticate:', error);
                }
            }
        };

        handleWelcomeSign();
    }, [isConnected, address, signMessageAsync]);

    if (isConnected) {
        return (
            <>
                <button 
                    className={`${styles.walletButton}`} 
                    onClick={() => disconnect()}
                    disabled={isSigning}
                >
                    <Wallet/>{isSigning ? 'Signing...' : 'Disconnect Wallet'}
                </button>
            </>
        );
    }
    return (
        <>
            <WalletOption
                key={connectors[0].uid}
                connector={connectors[0]}
                onClick={() => connect({ connector: connectors[0] })}
                isConnecting={status === 'pending'}
            />
        </>
    );
};

function WalletOption({
    connector,
    onClick,
    isConnecting,
}: {
    connector: Connector;
    onClick: () => void;
    isConnecting: boolean;
}) {
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            const provider = await connector.getProvider();
            setReady(!!provider);
        })();
    }, [connector]);

    return (
        <button
            className={`${styles.walletButton}`}
            disabled={!ready || isConnecting}
            onClick={onClick}
        >
            <Wallet /> {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
    );
}

export default WalletButton; 