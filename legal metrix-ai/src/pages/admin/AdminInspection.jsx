import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList, Package, UserCircle2, CheckCircle2,
  XCircle, AlertTriangle, Filter, ChevronLeft, ChevronRight,
  ShieldCheck, Search, Activity
} from 'lucide-react';

function AdminInspections() {
  const location = useLocation();
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pre-filled from Officer Drawer if available
  const initialOfficerFilter = location.state?.officerFilter || '';
  const initialOfficerName = location.state?.officerName || '';

  const [statusFilter, setStatusFilter] = useState('');
  const [officerFilter, setOfficerFilter] = useState(initialOfficerFilter);
  const [page, setPage] = useState(1);

  useEffect(() => {
    API.get('/admin/officers')
      .then((res) => setOfficers(res.data.officers))
      .catch(() => {}); 
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [statusFilter, officerFilter, page]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (officerFilter) params.officer = officerFilter;

      const res = await API.get('/admin/inspections', { params });
      setInspections(res.data.inspections);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pass':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            backgroundColor: 'var(--teal-light)', color: 'var(--teal)',
            padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
            border: '1px solid var(--teal)33', whiteSpace: 'nowrap',
          }}>
            <CheckCircle2 size={13} strokeWidth={2.5} /> COMPLIANT
          </span>
        );
      case 'fail':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            backgroundColor: 'var(--danger-light)', color: 'var(--danger)',
            padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
            border: '1px solid var(--danger)33', whiteSpace: 'nowrap',
          }}>
            <XCircle size={13} strokeWidth={2.5} /> VIOLATION
          </span>
        );
      case 'review':
      default:
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            backgroundColor: 'var(--amber-light)', color: 'var(--amber)',
            padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
            border: '1px solid var(--amber)33', whiteSpace: 'nowrap',
          }}>
            <AlertTriangle size={13} strokeWidth={2.5} /> NEEDS REVIEW
          </span>
        );
    }
  };

  const getSubmissionReview = (submission) => {
    if (!submission || !['approved', 'sent_back'].includes(submission.status)) {
      return <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Pending review</span>;
    }

    const isApproved = submission.status === 'approved';
    const reviewerName = submission.reviewedBy?.name || 'Admin unavailable';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 600, color: isApproved ? 'var(--teal)' : 'var(--danger)' }}>
        {isApproved ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
        <div>
          <div>{isApproved ? 'Accepted' : 'Sent back'}</div>
          <div style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 500 }}>{reviewerName}</div>
        </div>
      </div>
    );
  };

  const activeFilterCount = (statusFilter ? 1 : 0) + (officerFilter ? 1 : 0);
  const selectedOfficerObj = officers.find(o => o._id === officerFilter);
  const displayOfficerName = selectedOfficerObj ? selectedOfficerObj.name : initialOfficerName;

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      {/* ── Header Banner ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center flex-wrap gap-5 p-6 md:p-[32px_36px] mb-7" style={{
        background: 'linear-gradient(135deg, #0b192e 0%, #162a45 60%, #7c4a00 100%)',
        borderRadius: '20px', color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(22,36,71,0.2)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,114,15,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mb-3 border" style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(4px)', borderColor: 'rgba(255,255,255,0.18)',
          }}>
            <ClipboardList size={13} color="var(--amber-light)" />
            Audit & Logging
          </div>
          <h1 className="text-2xl md:text-[28px] font-extrabold m-0 tracking-tight" style={{ color: '#FFFFFF' }}>
            {displayOfficerName ? `Inspections by ${displayOfficerName.split(' ')[0]}` : 'All System Inspections'}
          </h1>
          <p className="text-sm md:text-[14px] m-0 max-w-[520px] mt-1.5" style={{ color: 'rgba(255,255,255,0.78)' }}>
            Comprehensive log of all AI scans. Filter by status or officer to audit compliance checks.
          </p>
        </div>

        {officerFilter && (
          <button
            onClick={() => {
              setOfficerFilter('');
              setPage(1);
              // Clear location state so title resets
              navigate(location.pathname, { replace: true });
            }}
            className="px-4 py-2.5 rounded-lg font-semibold text-sm w-full md:w-auto mt-2 md:mt-0 relative z-10"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#FFF', cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.2s'
            }}
          >
            Clear Officer Filter
          </button>
        )}
      </div>

      {/* ── Filters & Table Container ─────────────────────────────────────── */}
      <div style={{
        backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', boxShadow: '0 2px 10px rgba(22,36,71,0.04)', overflow: 'hidden',
      }}>
        
        {/* Top Controls: Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center flex-wrap gap-4 p-4 sm:p-[20px_24px]" style={{
          borderBottom: '1px solid var(--border)',
          backgroundColor: '#FCFDFD',
        }}>
          <div>
            <h3 className="flex items-center gap-2 flex-wrap" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--navy)', margin: 0 }}>
              Inspection Log
              {activeFilterCount > 0 && (
                <span style={{ backgroundColor: 'var(--amber-light)', color: 'var(--amber)', fontSize: '12px', padding: '2px 8px', borderRadius: '99px' }}>
                  {activeFilterCount} Active Filter(s)
                </span>
              )}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '2px 0 0 0' }}>
              Showing {inspections.length} results for page {pagination.page}
            </p>
          </div>

          <div className="flex gap-3 items-center flex-wrap w-full md:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto p-1.5 rounded-[10px]" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="hidden sm:flex items-center pl-1.5">
                <Filter size={16} color="var(--muted)" />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full sm:w-auto"
                style={selectStyle}
              >
                <option value="">All Statuses</option>
                <option value="pass">Compliant (Pass)</option>
                <option value="fail">Violation (Fail)</option>
                <option value="review">Needs Review</option>
              </select>

              <select
                value={officerFilter}
                onChange={(e) => { setOfficerFilter(e.target.value); setPage(1); }}
                className="w-full sm:w-auto"
                style={selectStyle}
              >
                <option value="">All Officers</option>
                {officers.map((o) => (
                  <option key={o._id} value={o._id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        {error && <div style={{ padding: '16px', color: 'var(--danger)', backgroundColor: 'var(--danger-light)', fontSize: '14px', fontWeight: 600 }}>{error}</div>}

        {/* Table / List Container */}
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--teal)', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 500 }}>Fetching data...</div>
          </div>
        ) : inspections.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <ClipboardList size={36} color="var(--border)" style={{ marginBottom: '12px', display: 'inline-block' }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>No inspections found</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <>
            {/* ── Mobile Card List (< sm) ── */}
            <div className="block sm:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
              {inspections.map((insp, idx) => (
                <div
                  key={insp._id}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: idx % 2 === 0 ? 'var(--surface)' : '#FAFCFB',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Row 1: thumbnail + product + ref */}
                  <div className="flex items-start gap-3 mb-3">
                    {insp.images?.[0] ? (
                      <img src={insp.images[0]} alt="product" className="shrink-0" style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                    ) : (
                      <div className="shrink-0 flex items-center justify-center" style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                        <Package size={18} color="var(--muted)" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)', lineHeight: 1.3 }}>{insp.productName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>#{insp._id.slice(-8)}</div>
                    </div>
                    {/* Status top-right */}
                    <div className="shrink-0" style={{ transform: 'scale(0.85)', transformOrigin: 'top right' }}>
                      {getStatusBadge(insp.status)}
                    </div>
                  </div>

                  {/* Row 2: Score + Violations + Officer */}
                  <div className="flex items-center gap-4 flex-wrap mb-2">
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Score</div>
                      <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--ink)' }}>{insp.complianceScore ?? 0}%</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Violations</div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: insp.violations?.length > 0 ? 'var(--danger)' : 'var(--teal)' }}>
                        {insp.violations?.length || 0}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Officer</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserCircle2 size={12} color="var(--muted)" />
                        {insp.officer ? insp.officer.name : '—'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Row 3: Submission review + Date */}
                  <div className="flex items-center justify-between gap-3" style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>Submission review</div>
                      {getSubmissionReview(insp.submission)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'right' }}>
                      {new Date(insp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop Table (≥ sm) ── */}
            <div className="hidden sm:block" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                    {['Product', 'Officer', 'Status', 'Submission review', 'Score', 'Violations', 'Date'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((insp, idx) => (
                    <tr
                      key={insp._id}
                      style={{
                        borderBottom: idx < inspections.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background-color 0.15s ease',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Product */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {insp.images?.[0] ? (
                            <img src={insp.images[0]} alt="product" className="shrink-0" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                          ) : (
                            <div className="shrink-0 flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                              <Package size={18} color="var(--muted)" />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>{insp.productName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace', marginTop: '2px' }}>#{insp._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Officer */}
                      <td style={{ padding: '16px 24px' }}>
                        {insp.officer ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                            <UserCircle2 size={16} color="var(--muted)" />
                            {insp.officer.name}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 24px' }}>
                        {getStatusBadge(insp.status)}
                      </td>

                      {/* Submission reviewer */}
                      <td style={{ padding: '16px 24px' }}>
                        {getSubmissionReview(insp.submission)}
                      </td>

                      {/* Score */}
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                          {insp.complianceScore ?? 0}%
                        </span>
                      </td>

                      {/* Violations */}
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          fontSize: '13px', fontWeight: 600,
                          color: insp.violations?.length > 0 ? 'var(--danger)' : 'var(--teal)'
                        }}>
                          {insp.violations?.length || 0}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--muted)' }}>
                        {new Date(insp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 sm:p-[16px_24px]" style={{
            borderTop: '1px solid var(--border)',
            backgroundColor: '#FCFDFD',
          }}>
            <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
              Showing Page <strong style={{ color: 'var(--ink)' }}>{pagination.page}</strong> of <strong style={{ color: 'var(--ink)' }}>{pagination.totalPages}</strong>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  ...pageBtnStyle,
                  opacity: page === 1 ? 0.5 : 1,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                style={{
                  ...pageBtnStyle,
                  opacity: page === pagination.totalPages ? 0.5 : 1,
                  cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: '12px 24px', fontSize: '12px',
  fontWeight: 700, color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

const selectStyle = {
  padding: '6px 12px', borderRadius: '6px',
  border: 'none', backgroundColor: 'transparent',
  fontSize: '13px', fontWeight: 600, color: 'var(--navy)',
  outline: 'none', cursor: 'pointer',
};

const pageBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '4px',
  padding: '6px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', backgroundColor: 'var(--surface)',
  color: 'var(--navy)', fontSize: '13px', fontWeight: 600,
  transition: 'all 0.15s ease',
};

export default AdminInspections;
