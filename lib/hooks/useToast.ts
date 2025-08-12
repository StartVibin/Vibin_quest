import { showToast } from "@/provider/ToastProvider";

export const useToast = () => {
  return {
    success: (message: string, options?: any) => showToast.success(message, options),
    error: (message: string, options?: any) => showToast.error(message, options),
    warning: (message: string, options?: any) => showToast.warning(message, options),
    info: (message: string, options?: any) => showToast.info(message, options),
    dismiss: (toastId: any) => showToast.dismiss(toastId),
  };
}; 