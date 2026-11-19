import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav aria-label="breadcrumb" className="py-2">
      <ol className="breadcrumb mb-0 align-items-center" style={{ fontSize: '0.85rem' }}>
        <li className="breadcrumb-item">
          <Link
            to="/"
            className="d-inline-flex align-items-center text-muted text-decoration-none"
          >
            <Home size={14} className="me-1" />
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <span className="mx-2 text-muted" style={{ display: 'inline-flex' }}>
                <ChevronRight size={13} />
              </span>
              <li
                className={`breadcrumb-item ${isLast ? 'active fw-semibold' : ''}`}
                aria-current={isLast ? 'page' : undefined}
                style={{ color: isLast ? 'var(--text-primary)' : undefined }}
              >
                {!isLast && item.link ? (
                  <Link to={item.link} className="text-muted text-decoration-none">
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
