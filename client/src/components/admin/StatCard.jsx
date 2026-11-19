import React from 'react';

const StatCard = ({ title, value, icon, change, isPositive = true, color = 'primary' }) => {
  const colorMap = {
    primary: {
      bg: 'rgba(var(--color-primary-rgb), 0.12)',
      text: 'var(--color-primary)',
    },
    secondary: {
      bg: 'rgba(var(--color-secondary-rgb), 0.15)',
      text: 'var(--color-secondary)',
    },
    success: {
      bg: 'var(--color-success-bg)',
      text: 'var(--color-success)',
    },
    warning: {
      bg: 'var(--color-warning-bg)',
      text: 'var(--color-warning)',
    },
    danger: {
      bg: 'var(--color-error-bg)',
      text: 'var(--color-error)',
    },
  }[color] || {
    bg: 'var(--bg-subtle)',
    text: 'var(--color-primary)',
  };

  return (
    <div
      className="card p-3 p-lg-4 border shadow-sm h-100"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
          {title}
        </span>
        <div
          className="p-2 rounded-circle d-flex align-items-center justify-content-center"
          style={{ backgroundColor: colorMap.bg, color: colorMap.text, width: '40px', height: '40px' }}
        >
          {icon}
        </div>
      </div>

      <div className="d-flex align-items-baseline justify-content-between">
        <h3 className="fw-extrabold mb-0" style={{ color: 'var(--text-primary)' }}>
          {value}
        </h3>
        {change && (
          <span
            className="fw-bold"
            style={{
              fontSize: '0.8rem',
              color: isPositive ? 'var(--color-success)' : 'var(--color-error)',
            }}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
