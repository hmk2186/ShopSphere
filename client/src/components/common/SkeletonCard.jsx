import React from 'react';

const SkeletonCard = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="card h-100 overflow-hidden border-0" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div
            style={{
              width: '100%',
              paddingTop: '100%',
              backgroundColor: 'var(--bg-subtle)',
              position: 'relative',
              animation: 'shimmer 1.5s infinite linear',
            }}
          />
          <div className="card-body p-3">
            <div
              style={{
                height: '14px',
                width: '40%',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '4px',
                marginBottom: '10px',
              }}
            />
            <div
              style={{
                height: '18px',
                width: '85%',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '4px',
                marginBottom: '14px',
              }}
            />
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div
                style={{
                  height: '22px',
                  width: '35%',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '4px',
                }}
              />
              <div
                style={{
                  height: '32px',
                  width: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonCard;
