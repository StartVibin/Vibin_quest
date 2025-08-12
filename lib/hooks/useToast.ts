import { showToast } from "@/provider/ToastProvider";

export const useToast = () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    success: (message: string, options?: any) => showToast.success(message, options),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any    
    error: (message: string, options?: any) => showToast.error(message, options),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warning: (message: string, options?: any) => showToast.warning(message, options),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: (message: string, options?: any) => showToast.info(message, options),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dismiss: (toastId: any) => showToast.dismiss(toastId),
  };
}; 