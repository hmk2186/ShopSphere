import React from 'react';
import { Tag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnnouncementBar = () => {
  return (
    <div className="announcement-bar d-flex align-items-center justify-content-center gap-2">
      <Sparkles size={14} className="text-warning" />
      <span>
        Special Promotion: Use code <strong className="text-warning">SPHERE25</strong> for 25% OFF | Free Global Shipping on orders over $100
      </span>
      <Link
        to="/shop"
        className="text-white text-decoration-underline ms-1 d-none d-md-inline"
        style={{ fontSize: '0.75rem' }}
      >
        Shop Deals
      </Link>
    </div>
  );
};

export default AnnouncementBar;
