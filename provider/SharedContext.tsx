"use client";

import { useContext, useState, createContext, ReactNode } from "react";

export interface ContextType {
    invitationCode: string;  // lowercase string type, not String object
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
        showWallet: true,
    });
    console.log(sharedValue);

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
