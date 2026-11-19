import React, { useState } from 'react';

const ImageGallery = ({ images = [] }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
  const validImages = images && images.length > 0 ? images : [{ url: fallback }];
  const activeImage = validImages[selectedImageIndex]?.url || validImages[0]?.url || fallback;

  return (
    <div className="d-flex flex-column gap-3">
      {/* 1. Main High-Resolution Viewport */}
      <div
        className="card overflow-hidden border-0 shadow-sm"
        style={{
          width: '100%',
          paddingTop: '85%',
          position: 'relative',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <img
          src={activeImage}
          alt="Product showcase"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '1.5rem',
            transition: 'transform 0.3s ease',
          }}
        />
      </div>

      {/* 2. Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="d-flex gap-2 overflow-auto py-1">
          {validImages.map((img, index) => {
            const isSelected = index === selectedImageIndex;
            return (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className="btn p-0 rounded overflow-hidden"
                style={{
                  width: '68px',
                  height: '68px',
                  flexShrink: 0,
                  border: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
                  backgroundColor: 'var(--bg-subtle)',
                  transition: 'all 0.2s ease',
                  opacity: isSelected ? 1 : 0.65,
                }}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
