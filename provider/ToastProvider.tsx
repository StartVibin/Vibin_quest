"use client";

import React from "react";
import { ToastContainer, toast } from "react-toastify";

// Toast configuration
const toastConfig = {
  position: "top-right" as const,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark" as const,
};

// Toast utility functions
export const showToast = {
  success: (message: string, options?: any) => toast.success(message, { ...toastConfig, ...options }),
  error: (message: string, options?: any) => toast.error(message, { ...toastConfig, ...options }),
  warning: (message: string, options?: any) => toast.warning(message, { ...toastConfig, ...options }),
  info: (message: string, options?: any) => toast.info(message, { ...toastConfig, ...options }),
  dismiss: (toastId: any) => toast.dismiss(toastId),
};

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer {...toastConfig} />
    </>
  );
};

export default ToastProvider; 