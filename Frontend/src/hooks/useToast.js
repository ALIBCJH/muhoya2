import { useContext } from 'react';
import { ToastContext } from '../components/ui/Toast';

/**
 * Toast Notification Hook
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default useToast;
