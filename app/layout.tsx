import type { Metadata } from "next";

import "./globals.css";

import { Header } from "@/widgets/Header";

export const metadata: Metadata = {
    title: "Name",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Header />

                {children}
            </body>
        </html>
    );
}
