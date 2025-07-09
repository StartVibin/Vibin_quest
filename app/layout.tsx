import type { Metadata } from "next";

import "./globals.css";

import { Header } from "@/widgets/Header";
import Web3Provider from "@/provider/WagmiProvider";
import ReactQueryProvider from "@/provider/ReactQueryProvider";
import Script from "next/script";

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
                <Script id="telegram-auth-callback">
                    {`
                        function onTelegramAuth(user) {
                            alert('Logged in as ' + user.first_name + ' ' + user.last_name + ' (' + user.id + (user.username ? ', @' + user.username : '') + ')');
                        }
                    `}
                </Script>
                <ReactQueryProvider>
                    <Web3Provider>
                        <Header />

                        {children}
                        <Script
                            async
                            src="https://telegram.org/js/telegram-widget.js?22"
                            data-telegram-login="MyVibinBot" // <-- your bot username, no @
                            data-size="large"
                            data-radius="5"
                            data-onauth="onTelegramAuth(user)"
                            data-request-access="write"
                        />
                    </Web3Provider>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
