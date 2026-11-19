import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav className="d-flex justify-content-center align-items-center gap-1 my-4" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
        style={{ width: '36px', height: '36px', padding: 0 }}
        aria-label="Previous Page"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((p, idx) => {
        if (p === '...') {
          return (
            <span key={`ellipsis-${idx}`} className="px-2 text-muted">
              ...
            </span>
          );
        }

        const isActive = p === currentPage;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`btn btn-sm d-flex align-items-center justify-content-center fw-semibold ${
              isActive ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            style={{ width: '36px', height: '36px', padding: 0 }}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
        style={{ width: '36px', height: '36px', padding: 0 }}
        aria-label="Next Page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
};

export default Pagination;
