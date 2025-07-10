import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./auth-provider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Web3Provider from "@/provider/WagmiProvider";
import ReactQueryProvider from "@/provider/ReactQueryProvider";
import { Header } from "@/widgets/Header";

export const metadata: Metadata = {
  title: "Vibin' Quest",
  description: "Participate in Vibin' Quests",
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
      </body>
    </html>
  );
}
