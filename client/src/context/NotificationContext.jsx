import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      const newToast = { id, type, title, message };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const notify = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
    info: (message, title = 'Information') => addToast({ type: 'info', title, message }),
  };

  return (
    <NotificationContext.Provider value={{ notify, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100% - 40px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: <CheckCircle size={20} className="text-success" />,
              border: 'var(--color-success)',
              bg: 'var(--color-success-bg)',
            },
            error: {
              icon: <AlertCircle size={20} className="text-danger" />,
              border: 'var(--color-error)',
              bg: 'var(--color-error-bg)',
            },
            warning: {
              icon: <AlertTriangle size={20} className="text-warning" />,
              border: 'var(--color-warning)',
              bg: 'var(--color-warning-bg)',
            },
            info: {
              icon: <Info size={20} className="text-primary" />,
              border: 'var(--color-primary)',
              bg: 'var(--color-primary-light)',
            },
          }[toast.type] || {
            icon: <Info size={20} />,
            border: 'var(--border-color)',
            bg: 'var(--bg-card)',
          };

          return (
            <div
              key={toast.id}
              className="card shadow-lg"
              style={{
                pointerEvents: 'auto',
                borderLeft: `4px solid ${typeConfig.border}`,
                backgroundColor: 'var(--bg-card)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                animation: 'slideInRight 0.3s ease',
              }}
            >
              <div className="d-flex align-items-start gap-2">
                <div className="pt-1">{typeConfig.icon}</div>
                <div className="flex-grow-1">
                  {toast.title && (
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {toast.title}
                    </div>
                  )}
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    {toast.message}
                  </div>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="btn btn-sm p-0 border-0 text-muted"
                  style={{ background: 'transparent' }}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
