import React, { useEffect } from 'react';
import { IconCheck, IconX } from './Icons';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg border ${
        type === 'success' 
          ? 'bg-green-600 text-white border-green-500' 
          : 'bg-red-600 text-white border-red-500'
      }`}>
        {type === 'success' ? <IconCheck className="w-5 h-5" /> : <IconX className="w-5 h-5" />}
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
};

export default Toast;