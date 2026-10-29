import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Usage: const notify = useToast(); notify('Saved'); notify('Failed', 'error');
export const useToast = () => useContext(ToastContext);
