import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon,
  title = 'No items found',
  description = 'There are currently no items to display.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div
      className="text-center py-5 px-3 d-flex flex-direction-column align-items-center justify-content-center"
      style={{ minHeight: '300px' }}
    >
      {icon && (
        <div
          className="mb-3 d-inline-flex p-3 rounded-circle"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--color-primary)',
          }}
        >
          {icon}
        </div>
      )}
      <h4 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h4>
      <p
        className="text-muted mb-4 mx-auto"
        style={{ maxWidth: '420px', fontSize: '0.95rem' }}
      >
        {description}
      </p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary px-4 py-2">
          {actionText}
        </Link>
      )}
      {actionText && !actionLink && onAction && (
        <button onClick={onAction} className="btn btn-primary px-4 py-2">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
