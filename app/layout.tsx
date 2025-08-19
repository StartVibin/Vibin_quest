
import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./auth-provider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Web3Provider from "@/provider/WagmiProvider";
import ReactQueryProvider from "@/provider/ReactQueryProvider";
import { Header } from "@/widgets/Header";
import { SharedProvider } from "@/provider/SharedContext";

export const metadata: Metadata = {
  title: "Vibin' App",
  description: "🎧Listen. Vibe. Own your music data. Powered by Spotify + Ethereum.",
  icons: {
    icon: '/img/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SharedProvider>
          <ReactQueryProvider>
            <Web3Provider>
              <AuthProvider>
                <Header />
                {children}
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                />
              </AuthProvider>
            </Web3Provider>
          </ReactQueryProvider>
        </SharedProvider>
      </body>
    </html>
  );
}
