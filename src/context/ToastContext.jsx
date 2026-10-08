import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Non-intrusive sleek Toast container */}
      <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 flex flex-col items-center sm:items-end gap-2 max-w-[92vw] sm:max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-full shadow-lg border text-xs sm:text-sm font-semibold transition-all transform animate-in fade-in slide-in-from-top-2 duration-200 ${
              toast.type === 'error'
                ? 'bg-[#DC2626] text-white border-red-700'
                : toast.type === 'info'
                ? 'bg-neutral-900/95 dark:bg-[#181818]/95 text-white border-neutral-700/80 backdrop-blur-md'
                : 'bg-neutral-900/95 dark:bg-[#181818]/95 text-white border-neutral-800 dark:border-neutral-700 backdrop-blur-md'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-white" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 shrink-0 text-sky-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
              )}
              <span className="truncate max-w-[240px] sm:max-w-xs">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-1 p-0.5 hover:opacity-75 transition-opacity cursor-pointer text-neutral-400 hover:text-white"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
