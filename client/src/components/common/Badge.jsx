import React from 'react';

const Badge = ({ variant = 'primary', children, className = '', pill = false }) => {
  const variantStyles = {
    primary: {
      bg: 'rgba(var(--color-primary-rgb), 0.12)',
      color: 'var(--color-primary)',
    },
    secondary: {
      bg: 'rgba(var(--color-secondary-rgb), 0.15)',
      color: 'var(--color-secondary)',
    },
    success: {
      bg: 'var(--color-success-bg)',
      color: 'var(--color-success)',
    },
    danger: {
      bg: 'var(--color-error-bg)',
      color: 'var(--color-error)',
    },
    warning: {
      bg: 'var(--color-warning-bg)',
      color: 'var(--color-warning)',
    },
    neutral: {
      bg: 'var(--bg-subtle)',
      color: 'var(--text-secondary)',
    },
  }[variant] || {
    bg: 'var(--bg-subtle)',
    color: 'var(--text-secondary)',
  };

  return (
    <span
      className={`d-inline-flex align-items-center justify-content-center px-2 py-1 fw-semibold ${className}`}
      style={{
        backgroundColor: variantStyles.bg,
        color: variantStyles.color,
        borderRadius: pill ? 'var(--radius-pill)' : 'var(--radius-sm)',
        fontSize: '0.75rem',
        letterSpacing: '0.02em',
        lineHeight: 1.2,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
