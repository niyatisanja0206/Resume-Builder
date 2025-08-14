import { useState } from 'react';
import type { ReactNode } from 'react';
import { ToastContext, type ToastType, type ToastTypeEnum } from '../contexts/ToastContext';

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const showToast = (message: string, type: ToastTypeEnum) => {
    const id = Date.now().toString();
    const newToast: ToastType = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: ToastProps) {
  const bgColor = 
    toast.type === 'success' ? 'bg-green-500' :
    toast.type === 'error' ? 'bg-red-500' :
    'bg-blue-500';

  return (
    <div className={`${bgColor} text-white px-4 py-2 rounded mb-2 relative`}>
      <span>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 text-white hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
