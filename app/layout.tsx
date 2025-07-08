import type { Metadata } from "next";

import "./globals.css";

import { Header } from "@/widgets/Header";
import Web3Provider from "@/provider/WagmiProvider";
import ReactQueryProvider from "@/provider/ReactQueryProvider";

export const metadata: Metadata = {
    title: "Vibin'",
    icons: {
        icon: [
            {
                url: '/img/icon.svg',
                type: 'image/svg+xml',
            },
            {
                url: '/favicon.ico',
                sizes: 'any',
            }
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <ReactQueryProvider>
                    <Web3Provider>
                        <Header />

                        {children}
                    </Web3Provider>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
