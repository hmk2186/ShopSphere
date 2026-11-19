import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import { adminService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import RatingStars from '../../components/common/RatingStars';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const AdminReviewsPage = () => {
  const { notify } = useNotification();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllReviews({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        limit: 10,
      });

      if (res.success) {
        setReviews(res.reviews || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage, statusFilter]);

  const handleModerate = async (id, currentStatus) => {
    try {
      const res = await adminService.moderateReview(id, !currentStatus);
      if (res.success) {
        notify.success(res.message);
        fetchReviews();
      }
    } catch (error) {
      notify.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      const res = await adminService.deleteReview(id);
      if (res.success) {
        notify.info('Review deleted');
        fetchReviews();
      }
    } catch (error) {
      notify.error(error.message);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 border-bottom mb-4">
        <div>
          <h3 className="fw-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
            Review Moderation
          </h3>
          <span className="text-muted" style={{ fontSize: '0.88rem' }}>
            Monitor customer feedback, filter spam, and ensure quality discussions
          </span>
        </div>

        <div className="d-flex gap-2">
          {['all', 'approved', 'pending'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`btn btn-sm text-capitalize ${
                statusFilter === st ? 'btn-primary' : 'btn-outline-secondary'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="card border shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm" role="status" />
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No customer reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={r.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                          alt={r.product?.name}
                          style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <span className="fw-semibold text-truncate" style={{ maxWidth: '180px' }}>
                          {r.product?.name || 'Unknown Item'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold" style={{ fontSize: '0.88rem' }}>{r.user?.name || 'Customer'}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{r.user?.email}</div>
                    </td>
                    <td>
                      <RatingStars rating={r.rating} size={13} showValue={false} />
                    </td>
                    <td>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: '280px', fontSize: '0.86rem' }}>
                        {r.title}
                      </div>
                      <div className="text-muted text-truncate" style={{ maxWidth: '280px', fontSize: '0.78rem' }}>
                        {r.comment}
                      </div>
                    </td>
                    <td>
                      <Badge variant={r.isApproved ? 'success' : 'warning'}>
                        {r.isApproved ? 'Approved' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          onClick={() => handleModerate(r._id, r.isApproved)}
                          className="btn btn-sm p-1 text-primary border-0"
                          title={r.isApproved ? 'Hide Review' : 'Approve Review'}
                        >
                          {r.isApproved ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="btn btn-sm p-1 text-danger border-0"
                          title="Delete Review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-top">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
