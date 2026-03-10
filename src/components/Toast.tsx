"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X, XCircle, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toastsStore: Toast[] = [];
let toastIdCounter = 0;

function addToastToStore(type: ToastType, message: string) {
  toastIdCounter++;
  const toast: Toast = { id: toastIdCounter, type, message };
  toastsStore.push(toast);
  toastListeners.forEach(listener => listener(toastsStore));
  
  setTimeout(() => {
    removeToastFromStore(toast.id);
  }, 5000);
}

function removeToastFromStore(id: number) {
  toastsStore = toastsStore.filter(t => t.id !== id);
  toastListeners.forEach(listener => listener(toastsStore));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToasts([...newToasts]);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const addToast = (type: ToastType, message: string) => {
    addToastToStore(type, message);
  };

  const removeToast = (id: number) => {
    removeToastFromStore(id);
  };

  return { toasts, addToast, removeToast };
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#22C55E]" />,
    error: <XCircle className="w-5 h-5 text-[#EF4444]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />,
    info: <AlertCircle className="w-5 h-5 text-[#3B82F6]" />,
  };

  const bgColors = {
    success: 'bg-[#22C55E]/10 border-[#22C55E]/30',
    error: 'bg-[#EF4444]/10 border-[#EF4444]/30',
    warning: 'bg-[#F59E0B]/10 border-[#F59E0B]/30',
    info: 'bg-[#3B82F6]/10 border-[#3B82F6]/30',
  };

  return (
    <div 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColors[toast.type]} animate-slide-in-top`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm text-[#FAFAFA]">{toast.message}</p>
      <button
        onClick={onRemove}
        className="text-[#71717A] hover:text-[#A1A1AA] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}
