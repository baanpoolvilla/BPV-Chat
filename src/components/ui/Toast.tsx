'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { ToastMessage } from '@/types';
import { X, Check, AlertCircle, Info } from 'lucide-react';

interface ToastProps extends Omit<ToastMessage, 'id'> {
  onClose: () => void;
}

const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-100',
      icon: <Check className="h-4 w-4" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      icon: <AlertCircle className="h-4 w-4" />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      icon: <Info className="h-4 w-4" />,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: <AlertCircle className="h-4 w-4" />,
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md items-center justify-between rounded-lg border px-4 py-3 shadow-lg animate-slide-in',
        config.bg,
        config.border,
        config.text
      )}
    >
      <div className="flex items-center gap-3">
        {config.icon}
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 inline-flex shrink-0 rounded-md opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };
