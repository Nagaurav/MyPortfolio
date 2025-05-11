import { createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

type ToastContextType = {
  showSuccess: (message: string, description?: string) => void;
  showError: (message: string, description?: string) => void;
  showWarning: (message: string, description?: string) => void;
  showInfo: (message: string, description?: string) => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  };

  const showError = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  };

  const showWarning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000,
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    toast(message, {
      action: {
        label: 'Confirm',
        onClick: onConfirm,
      },
      cancel: {
        label: 'Cancel',
        onClick: onCancel,
      },
      duration: Infinity,
    });
  };

  return (
    <ToastContext.Provider value={{
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showConfirm,
    }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};