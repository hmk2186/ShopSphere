import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // sm, md, lg, xl
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthMap = {
    sm: '400px',
    md: '550px',
    lg: '800px',
    xl: '1050px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card shadow-lg"
        style={{
          width: '100%',
          maxWidth: maxWidthMap[size] || '550px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-modal)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header d-flex align-items-center justify-content-between p-3 border-bottom">
          <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h5>
          <button
            onClick={onClose}
            className="btn btn-sm p-1 border-0 text-muted"
            style={{ background: 'transparent' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="card-body p-4" style={{ overflowY: 'auto' }}>
          {children}
        </div>

        {footer && (
          <div className="card-footer p-3 border-top bg-transparent d-flex justify-content-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
