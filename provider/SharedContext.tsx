"use client";

import { useContext, useState, useEffect, createContext, ReactNode } from "react";

export interface ContextType {
    invitationCode: string;
    spotifyEmail: string;
    showWallet: boolean;
}

interface SharedContextType {
    sharedValue: ContextType;
    setSharedValue: React.Dispatch<React.SetStateAction<ContextType>>;
}

const SharedContext = createContext<SharedContextType | undefined>(undefined);

export const SharedProvider = ({ children }: { children: ReactNode }) => {
    
    const [sharedValue, setSharedValue] = useState<ContextType>({
        invitationCode: "",
        spotifyEmail: "",
        showWallet: true,
    });
    
    // Load from localStorage on mount
    useEffect(() => {
        const storedInvitationCode = localStorage.getItem("invitation_code") ?? "";
        const storedSpotifyEmail = localStorage.getItem("spotify_email") ?? "";
        setSharedValue({
            invitationCode: storedInvitationCode,
            spotifyEmail: storedSpotifyEmail,
            showWallet: true,
        });
    }, []);

    console.log("sharedValue ", sharedValue);

    // Optional: keep localStorage updated when sharedValue changes
    useEffect(() => {
        localStorage.setItem("invitation_code", sharedValue.invitationCode);
        localStorage.setItem("spotify_email", sharedValue.spotifyEmail);
    }, [sharedValue.invitationCode, sharedValue.spotifyEmail]);

    return (
        <SharedContext.Provider value={{ sharedValue, setSharedValue }}>
            {children}
        </SharedContext.Provider>
    );
};

export const useSharedContext = (): SharedContextType => {
    const ctx = useContext(SharedContext);
    if (!ctx) {
        throw new Error("useSharedContext must be used within SharedProvider");
    }
    return ctx;
};
