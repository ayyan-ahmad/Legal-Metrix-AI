import { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  Inbox, CheckCircle2, RotateCcw, Package, UserCircle2,
  AlertTriangle, XCircle, ChevronDown, ChevronUp, Sparkles,
  ClipboardCheck, MessageSquare, X, RefreshCw,
} from 'lucide-react';

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pass:   { label: 'COMPLIANT',    color: 'var(--teal)',   bg: 'var(--teal-light)',   Icon: CheckCircle2 },
    fail:   { label: 'VIOLATION',    color: 'var(--danger)', bg: 'var(--danger-light)', Icon: XCircle },
    review: { label: 'NEEDS REVIEW', color: 'var(--amber)',  bg: 'var(--amber-light)',  Icon: AlertTriangle },
  };
  const cfg = map[status] || map.review;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      backgroundColor: cfg.bg, color: cfg.color,
      padding: '4px 11px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
      border: `1px solid ${cfg.color}33`, whiteSpace: 'nowrap',
    }}>
      <cfg.Icon size={12} strokeWidth={2.5} /> {cfg.label}
    </span>
  );
}

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({ inspection, onClose, onDone }) {
  const [decision, setDecision] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!decision) { setError('Please select a decision.'); return; }
    try {
      setSubmitting(true);
      await API.post(`/inspections/${inspection._id}/review`, { decision, remarks });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(11,25,46,0.65)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
      <div style={{
        backgroundColor: 'var(--surface)', borderRadius: '20px',
        boxShadow: '0 24px 56px rgba(0,0,0,0.22)',
        width: '100%', maxWidth: '480px',
        animation: 'modalIn 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--navy)' }}>
              Review Submission
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--muted)', fontFamily: 'monospace', fontWeight: 600 }}>
              Case #{inspection.submission?.caseNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: '8px', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--muted)', flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Product Info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px', backgroundColor: 'var(--bg)',
            borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '20px',
          }}>
            {inspection.images?.[0] ? (
              <img
                src={inspection.images[0]} alt="product"
                style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Package size={18} color="var(--muted)" />
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>{inspection.productName}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <UserCircle2 size={12} /> {inspection.officer?.name || '—'}
                &nbsp;·&nbsp;
                <StatusBadge status={inspection.status} />
              </div>
            </div>
          </div>

          {/* Decision Buttons */}
          <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Your Decision
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {[
              { value: 'approved',  label: '✓  Approve',    color: 'var(--teal)',   bg: 'var(--teal-light)'   },
              { value: 'sent_back', label: '↩  Send Back',  color: 'var(--danger)', bg: 'var(--danger-light)' },
            ].map(({ value, label, color, bg }) => (
              <button
                key={value}
                onClick={() => setDecision(value)}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: '10px', fontWeight: 700,
                  fontSize: '13px', cursor: 'pointer', transition: 'all 0.18s ease',
                  border: decision === value ? `2px solid ${color}` : '2px solid var(--border)',
                  backgroundColor: decision === value ? bg : 'var(--bg)',
                  color: decision === value ? color : 'var(--muted)',
                  boxShadow: decision === value ? `0 0 0 3px ${color}22` : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Remarks */}
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            <MessageSquare size={12} style={{ display: 'inline', marginRight: '5px' }} />
            Remarks (optional)
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add remarks for the officer..."
            style={{
              width: '100%', minHeight: '80px', padding: '10px 14px',
              border: '1px solid var(--border)', borderRadius: '8px',
              fontSize: '13px', resize: 'vertical', outline: 'none',
              fontFamily: 'inherit', color: 'var(--ink)', backgroundColor: '#fff',
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
                background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !decision}
              style={{
                padding: '10px 22px', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
                backgroundColor: decision === 'approved' ? 'var(--teal)' : decision === 'sent_back' ? 'var(--danger)' : 'var(--navy)',
                color: '#fff', border: 'none',
                cursor: submitting || !decision ? 'not-allowed' : 'pointer',
                opacity: submitting || !decision ? 0.6 : 1, transition: 'all 0.2s',
              }}
            >
              {submitting ? 'Submitting...' : 'Confirm Decision'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Submission Card ───────────────────────────────────────────────────────────
function SubmissionCard({ insp, onReview }) {
  const [expanded, setExpanded] = useState(false);
  const submittedDate = insp.submission?.submittedAt
    ? new Date(insp.submission.submittedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <div
      style={{
        border: '1px solid var(--border)', borderRadius: '14px',
        backgroundColor: 'var(--surface)', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(22,36,71,0.04)',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,36,71,0.09)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,36,71,0.04)')}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', flexWrap: 'wrap' }}>
        {insp.images?.[0] ? (
          <img src={insp.images[0]} alt="product" style={{ width: '46px', height: '46px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={20} color="var(--muted)" />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--ink)' }}>{insp.productName}</span>
            <StatusBadge status={insp.status} />
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '5px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <UserCircle2 size={12} /> {insp.officer?.name || '—'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'monospace', fontWeight: 600 }}>
              #{insp.submission?.caseNumber || insp._id.slice(-8)}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Submitted: {submittedDate}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={() => onReview(insp)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '9px',
              backgroundColor: 'var(--navy)', color: '#fff',
              border: 'none', fontWeight: 700, fontSize: '13px',
              cursor: 'pointer', transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <ClipboardCheck size={15} /> Review
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            title="Toggle details"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '34px', height: '34px', borderRadius: '8px',
              backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
              cursor: 'pointer', color: 'var(--muted)', flexShrink: 0, transition: 'all 0.15s',
            }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border)', padding: '16px 20px',
          backgroundColor: 'var(--bg)', display: 'flex', gap: '24px', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Compliance Score</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)' }}>{insp.complianceScore ?? 0}%</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Violations</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: insp.violations?.length > 0 ? 'var(--danger)' : 'var(--teal)' }}>
              {insp.violations?.length || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Officer Email</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{insp.officer?.email || '—'}</div>
          </div>
          {insp.violations?.length > 0 && (
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Violation Details</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {insp.violations.map((v, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px',
                      backgroundColor: 'var(--danger-light)', color: 'var(--danger)',
                      border: '1px solid var(--danger)33',
                    }}
                  >
                    {v.label || v.field || v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main AdminSubmissions Component ───────────────────────────────────────────
function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await API.get('/inspections/submissions');
      setSubmissions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReviewDone = () => {
    setReviewTarget(null);
    fetchSubmissions(true);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

      {reviewTarget && (
        <ReviewModal
          inspection={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onDone={handleReviewDone}
        />
      )}

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div
        className="flex flex-col md:flex-row justify-between items-start md:items-center flex-wrap gap-5 p-6 md:p-[32px_36px] mb-7"
        style={{
          background: 'linear-gradient(135deg, #0b192e 0%, #162a45 60%, #7c4a00 100%)',
          borderRadius: '20px', color: '#FFFFFF',
          boxShadow: '0 10px 30px rgba(22,36,71,0.2)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,114,15,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'rgba(255,255,255,0.12)', padding: '4px 14px',
            borderRadius: '99px', fontSize: '12px', fontWeight: 600,
            marginBottom: '12px', backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}>
            <Sparkles size={13} color="var(--amber-light)" /> Admin Review Inbox
          </div>
          <h1 className="text-2xl md:text-[28px]" style={{ fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
            Officer Submissions
          </h1>
          <p className="text-sm md:text-[14px]" style={{ color: 'rgba(255,255,255,0.78)', marginTop: '6px', margin: 0, maxWidth: '520px' }}>
            Review inspection records submitted by field officers. Approve or send back with remarks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          {!loading && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px 18px',
              borderRadius: '12px', backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.22)',
            }}>
              <Inbox size={18} color="var(--amber-light)" />
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                {submissions.length} Pending
              </span>
            </div>
          )}
          <button
            onClick={() => fetchSubmissions(true)}
            title="Refresh"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '42px', height: '42px', borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.22)',
              cursor: 'pointer', color: '#fff', transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={17} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--amber)', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--muted)', margin: 0 }}>Loading submissions...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '20px 24px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '12px', fontWeight: 600, fontSize: '14px' }}>
          {error}
        </div>
      ) : submissions.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '80px 20px', gap: '14px',
          backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={30} color="var(--teal)" />
          </div>
          <p style={{ fontWeight: 700, fontSize: '17px', color: 'var(--ink)', margin: 0 }}>All caught up!</p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0, textAlign: 'center', maxWidth: '360px' }}>
            No pending submissions from officers right now. New submissions will appear here as officers file their reports.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Summary bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
            padding: '12px 18px',
            backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Inbox size={16} color="var(--navy)" />
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} awaiting your review
            </span>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={13} color="var(--teal)" /> Approve to file officially
              </span>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <RotateCcw size={13} color="var(--danger)" /> Send back for corrections
              </span>
            </div>
          </div>

          {/* Cards */}
          {submissions.map((insp) => (
            <SubmissionCard key={insp._id} insp={insp} onReview={setReviewTarget} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminSubmissions;
