import { createContext, useContext } from 'react';

export type ToastTypeEnum = 'success' | 'error' | 'info';

export interface ToastType {
  id: string;
  message: string;
  type: ToastTypeEnum;
}

export interface ToastContextType {
  toasts: ToastType[];
  showToast: (message: string, type: ToastTypeEnum) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
