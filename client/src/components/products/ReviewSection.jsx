import React, { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle, MessageSquarePlus, Trash2 } from 'lucide-react';
import { reviewService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import RatingStars from '../common/RatingStars';
import Modal from '../common/Modal';

const ReviewSection = ({ productId, averageRating = 4.5, reviewsCount = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const { notify } = useNotification();
  const [reviews, setReviews] = useState([]);
  const [breakdownPercent, setBreakdownPercent] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await reviewService.getByProduct(productId);
      if (res.success) {
        setReviews(res.reviews || []);
        if (res.breakdownPercent) {
          setBreakdownPercent(res.breakdownPercent);
        }
      }
    } catch (err) {
      console.warn('[Reviews] Fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      notify.warning('Please sign in to post a product review.');
      return;
    }

    if (!title.trim() || !comment.trim()) {
      notify.error('Please provide both a title and review text.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await reviewService.create({
        productId,
        rating,
        title,
        comment,
      });

      if (res.success) {
        notify.success('Your review has been published!');
        setIsModalOpen(false);
        setTitle('');
        setComment('');
        setRating(5);
        fetchReviews();
      }
    } catch (error) {
      notify.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      const res = await reviewService.delete(reviewId);
      if (res.success) {
        notify.info('Review deleted');
        fetchReviews();
      }
    } catch (error) {
      notify.error(error.message);
    }
  };

  return (
    <div className="mt-5 pt-4 border-top" style={{ borderColor: 'var(--border-color)' }}>
      {/* 1. Header with Aggregate Summary and Action */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Customer Reviews & Ratings
          </h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Real feedback from verified purchasers.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              notify.warning('Please log in to leave a review.');
            } else {
              setIsModalOpen(true);
            }
          }}
          className="btn btn-primary d-inline-flex align-items-center gap-2"
        >
          <MessageSquarePlus size={18} /> Write a Review
        </button>
      </div>

      {/* 2. Rating Breakdown Meter */}
      <div className="card p-4 mb-4 border" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="row g-4 align-items-center">
          <div className="col-12 col-md-4 text-center border-md-end">
            <div className="display-4 fw-extrabold" style={{ color: 'var(--text-primary)' }}>
              {Number(averageRating).toFixed(1)}
            </div>
            <RatingStars rating={averageRating} size={20} showValue={false} />
            <div className="text-muted mt-2" style={{ fontSize: '0.88rem' }}>
              Based on {reviewsCount || reviews.length} customer ratings
            </div>
          </div>

          <div className="col-12 col-md-8">
            <div className="d-flex flex-column gap-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percent = breakdownPercent[stars] || 0;
                return (
                  <div key={stars} className="d-flex align-items-center gap-3">
                    <span className="text-secondary fw-semibold text-nowrap" style={{ width: '60px', fontSize: '0.85rem' }}>
                      {stars} Stars
                    </span>
                    <div className="progress flex-grow-1" style={{ height: '8px', backgroundColor: 'var(--bg-subtle)' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: 'var(--color-secondary)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                    <span className="text-muted text-end text-nowrap" style={{ width: '40px', fontSize: '0.8rem' }}>
                      {percent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Customer Reviews List */}
      <div className="d-flex flex-column gap-3">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p className="mb-2">No reviews yet for this product.</p>
            <span style={{ fontSize: '0.88rem' }}>Be the first to share your experience with the community!</span>
          </div>
        ) : (
          reviews.map((rev) => {
            const isOwner = user && (user.id === rev.user?._id || user._id === rev.user?._id);
            return (
              <div
                key={rev._id}
                className="card p-3 border"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={rev.user?.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={rev.user?.name || 'Reviewer'}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {rev.user?.name || 'Verified Customer'}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {rev.isVerifiedPurchase && (
                      <span className="badge badge-success d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                        <CheckCircle size={12} /> Verified Purchase
                      </span>
                    )}
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="btn btn-sm p-1 text-danger border-0"
                        title="Delete Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <RatingStars rating={rev.rating} size={14} showValue={false} />
                </div>

                <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {rev.title}
                </h6>
                <p className="text-secondary mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {rev.comment}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Write Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Share Your Review"
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmitReview} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitReview}>
          {/* Star selector */}
          <div className="mb-3">
            <label className="form-label">Overall Rating</label>
            <div className="d-flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setRating(num)}
                  className="btn p-1 border-0"
                  style={{ background: 'transparent' }}
                >
                  <Star
                    size={28}
                    fill={num <= rating ? '#FF8A35' : 'none'}
                    stroke="#FF8A35"
                    strokeWidth={1.8}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Review Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Incredibly crisp sound quality and durable finish!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Detailed Experience</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="What did you like or dislike about this product? How is the quality and performance?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReviewSection;
