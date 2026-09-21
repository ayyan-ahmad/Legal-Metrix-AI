import { useEffect, useState } from 'react';
import API, { API_BASE_URL } from '../api/axios';
import EvidencePanel from '../components/EvidencePanel';
import {
  History as HistoryIcon,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Package,
  User,
  ShieldCheck,
  Calendar,
  Sparkles,
  Download,
  Filter,
  X,
  Eye,
  FileText,
  Clock,
} from 'lucide-react';

const statusMeta = (status) => ({
  pass: {
    bg: 'var(--teal-light)',
    border: 'var(--teal)',
    text: 'var(--teal)',
    label: 'COMPLIANT',
    Icon: CheckCircle2,
  },
  fail: {
    bg: 'var(--danger-light)',
    border: 'var(--danger)',
    text: 'var(--danger)',
    label: 'NON-COMPLIANT',
    Icon: XCircle,
  },
  review: {
    bg: 'var(--amber-light)',
    border: 'var(--amber)',
    text: 'var(--amber)',
    label: 'NEEDS REVIEW',
    Icon: AlertTriangle,
  },
}[status] || {
  bg: 'var(--bg)',
  border: 'var(--border)',
  text: 'var(--muted)',
  label: status?.toUpperCase() || 'UNKNOWN',
  Icon: AlertTriangle,
});

// NAYA: Submission workflow status ke liye badge styling
const submissionMeta = (subStatus) => ({
  draft: { bg: 'var(--bg)', text: 'var(--muted)', border: 'var(--border)', label: 'Not Submitted' },
  submitted: { bg: 'var(--amber-light)', text: 'var(--amber)', border: 'var(--amber)', label: 'Pending Review' },
  approved: { bg: 'var(--teal-light)', text: 'var(--teal)', border: 'var(--teal)', label: 'Approved' },
  sent_back: { bg: 'var(--danger-light)', text: 'var(--danger)', border: 'var(--danger)', label: 'Sent Back' },
}[subStatus] || { bg: 'var(--bg)', text: 'var(--muted)', border: 'var(--border)', label: 'Not Submitted' });

function History() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showSeizureForm, setShowSeizureForm] = useState(false);
  const [seizureForm, setSeizureForm] = useState({
    samplesSeized: '',
    samplesReleased: '',
    disposalNote: '',
    reasonsToBelieve: '',
  });
  const [seizureSubmitting, setSeizureSubmitting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelected(null);
        setShowSeizureForm(false);
      }
    };
    if (selected) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selected]);

  const handleSeizureSubmit = async (e) => {
    e.preventDefault();
    setSeizureSubmitting(true);
    try {
      const response = await API.post(`/inspections/${selected._id}/seizure-memo`, {
        samplesSeized: Number(seizureForm.samplesSeized),
        samplesReleased: Number(seizureForm.samplesReleased),
        disposalNote: seizureForm.disposalNote,
        reasonsToBelieve: seizureForm.reasonsToBelieve,
      });
      const updatedInspection = response.data.inspection;
      setSelected(updatedInspection);
      setInspections((prev) =>
        prev.map((item) => (item._id === updatedInspection._id ? updatedInspection : item))
      );
      setShowSeizureForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate seizure memo');
    } finally {
      setSeizureSubmitting(false);
    }
  };

  const handleSubmitForRecord = async (inspectionId) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await API.post(`/inspections/${inspectionId}/submit`);
      const updatedInspection = response.data.inspection;
      setSelected(updatedInspection);
      setInspections((prev) =>
        prev.map((item) => (item._id === updatedInspection._id ? updatedInspection : item))
      );
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit inspection');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const response = await API.get('/inspections');
      setInspections(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = inspections.length;
  const passed = inspections.filter((i) => i.status === 'pass').length;
  const failed = inspections.filter((i) => i.status === 'fail').length;
  const review = inspections.filter((i) => i.status === 'review').length;

  const filteredInspections = inspections.filter((item) => {
    const matchesSearch =
      item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.officer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item._id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '80px 20px', gap: '16px', color: 'var(--muted)'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid var(--border)', borderTopColor: 'var(--teal)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontWeight: 500, fontSize: '15px' }}>Loading Legal Metrix Audit Trail…</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '50px' }}>

      {/* ── 1. Page Header Banner ────────────────────────────── */}
      <div
        className="!px-5 sm:!px-8 !py-6 sm:!py-7"
        style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, #1c2b50 100%)',
          borderRadius: '20px',
          color: '#FFFFFF',
          marginBottom: '28px',
          boxShadow: '0 8px 24px rgba(22,36,71,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.12)', padding: '4px 12px',
            borderRadius: '99px', fontSize: '12px', fontWeight: 600, marginBottom: '10px'
          }}>
            <ShieldCheck size={14} color="var(--teal-light)" />
            Official Metrology Audit Logs
          </div>
          <h1 className="text-xl sm:text-[26px]" style={{ fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Inspection History &amp; Audit Trail
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.75)', marginTop: '4px', margin: 0 }}>
            Complete historical record of all scanned products, AI evidence extractions, and compliance status.
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center', minWidth: '60px'
          }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 700 }}>Total</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{total}</div>
          </div>
          <div style={{
            backgroundColor: 'rgba(15,110,86,0.3)', padding: '8px 14px', borderRadius: '10px',
            border: '1px solid var(--teal)', textAlign: 'center', minWidth: '60px'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--teal-light)', textTransform: 'uppercase', fontWeight: 700 }}>Pass</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{passed}</div>
          </div>
          <div style={{
            backgroundColor: 'rgba(163,45,45,0.3)', padding: '8px 14px', borderRadius: '10px',
            border: '1px solid var(--danger)', textAlign: 'center', minWidth: '60px'
          }}>
            <div style={{ fontSize: '11px', color: '#FCA5A5', textTransform: 'uppercase', fontWeight: 700 }}>Fail</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{failed}</div>
          </div>
        </div>
      </div>

      {/* ── 2. Table Controls & Filters ───────────────────────── */}
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
        overflow: 'hidden',
        marginBottom: selected ? '28px' : '0',
      }}>
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5"
          style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#FCFDFD' }}
        >
          <div style={{ position: 'relative' }} className="w-full sm:max-w-sm">
            <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search product, officer, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: 'var(--surface)',
                color: 'var(--ink)',
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
          }}>
            {[
              { id: 'all', label: `All (${total})` },
              { id: 'pass', label: `Pass (${passed})` },
              { id: 'fail', label: `Fail (${failed})` },
              { id: 'review', label: `Review (${review})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  flex: 1,
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: statusFilter === tab.id ? 700 : 500,
                  backgroundColor: statusFilter === tab.id ? 'var(--surface)' : 'transparent',
                  color: statusFilter === tab.id ? 'var(--navy)' : 'var(--muted)',
                  cursor: 'pointer',
                  boxShadow: statusFilter === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredInspections.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--muted)' }}>
            <Package size={42} color="var(--border)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
              No audit records found
            </h4>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              {total === 0 ? 'No inspections have been conducted yet.' : 'Try adjusting your search criteria or filter.'}
            </p>
          </div>
        ) : (
          <>
            {/* ── Mobile Card List (< sm) ── */}
            <div className="block sm:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredInspections.map((insp, idx) => {
                const sm = statusMeta(insp.status);
                const subM = submissionMeta(insp.submission?.status);
                const isOpen = selected?._id === insp._id;
                const StatusIcon = sm.Icon;

                return (
                  <div
                    key={insp._id}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: isOpen ? 'var(--teal-light)' : idx % 2 === 0 ? 'var(--surface)' : '#FAFCFB',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {insp.images?.[0] ? (
                        <img
                          src={insp.images[0]}
                          alt={insp.productName}
                          style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Package size={18} color="var(--muted)" />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)', lineHeight: 1.3 }}>
                          {insp.productName || 'Unnamed Product'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                          REF: #{insp._id.substring(insp._id.length - 8).toUpperCase()}
                        </div>
                      </div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        backgroundColor: sm.bg, color: sm.text,
                        padding: '3px 9px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
                        border: `1px solid ${sm.border}44`, letterSpacing: '0.3px',
                        flexShrink: 0, whiteSpace: 'nowrap',
                      }}>
                        <StatusIcon size={11} strokeWidth={2.5} />
                        {sm.label}
                      </span>
                    </div>

                    {/* NAYA: Submission status badge row */}
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        backgroundColor: subM.bg, color: subM.text,
                        padding: '3px 9px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
                        border: `1px solid ${subM.border}44`,
                      }}>
                        <Clock size={10} strokeWidth={2.5} />
                        {subM.label}
                      </span>
                      {insp.submission?.caseNumber && (
                        <span style={{ fontSize: '10px', color: 'var(--muted)', marginLeft: '8px', fontFamily: 'monospace' }}>
                          {insp.submission.caseNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap mb-3">
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Score</div>
                        <span style={{
                          fontSize: '13px', fontWeight: 800, color: sm.text,
                          backgroundColor: sm.bg, padding: '2px 7px', borderRadius: '5px',
                          border: `1px solid ${sm.border}44`
                        }}>
                          {insp.complianceScore ?? 0}%
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Inspector</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 500 }}>
                          {insp.officer?.name || 'Authorized'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Date</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {insp.createdAt
                            ? new Date(insp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelected(isOpen ? null : insp)}
                      style={{
                        width: '100%',
                        backgroundColor: isOpen ? 'var(--navy)' : 'var(--surface)',
                        color: isOpen ? '#FFFFFF' : 'var(--navy)',
                        border: '1px solid var(--navy)',
                        borderRadius: '8px',
                        padding: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isOpen ? (
                        <><Eye size={14} /> Viewing Report</>
                      ) : (
                        <><Eye size={14} /> View Audit Report</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop Table (≥ sm) ── */}
            <div className="hidden sm:block" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--navy)' }}>
                    {['Product Item', 'Inspector Officer', 'Score', 'Status', 'Submission', 'Audit Date', 'Action'].map((h, i, arr) => (
                      <th
                        key={h}
                        style={{
                          padding: '14px 20px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'rgba(255,255,255,0.85)',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          textAlign: i === arr.length - 1 ? 'right' : 'left',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInspections.map((insp, idx) => {
                    const sm = statusMeta(insp.status);
                    const subM = submissionMeta(insp.submission?.status);
                    const isOpen = selected?._id === insp._id;
                    const StatusIcon = sm.Icon;

                    return (
                      <tr
                        key={insp._id}
                        style={{
                          borderBottom: idx < filteredInspections.length - 1 ? '1px solid var(--border)' : 'none',
                          backgroundColor: isOpen
                            ? 'var(--teal-light)'
                            : idx % 2 === 0 ? 'var(--surface)' : '#FAFCFB',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {insp.images?.[0] ? (
                              <img
                                src={insp.images[0]}
                                alt={insp.productName}
                                style={{
                                  width: '40px', height: '40px', borderRadius: '8px',
                                  objectFit: 'cover', border: '1px solid var(--border)',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '40px', height: '40px', borderRadius: '8px',
                                backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                <Package size={18} color="var(--muted)" />
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                                {insp.productName || 'Unnamed Product'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                                REF: #{insp._id.substring(insp._id.length - 8).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                            <User size={14} color="var(--muted)" />
                            {insp.officer?.name || 'Authorized Inspector'}
                          </div>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '14px', fontWeight: 800, color: sm.text,
                              backgroundColor: sm.bg, padding: '3px 8px', borderRadius: '6px',
                              border: `1px solid ${sm.border}44`
                            }}>
                              {insp.complianceScore ?? 0}%
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            backgroundColor: sm.bg, color: sm.text,
                            padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                            border: `1px solid ${sm.border}44`, letterSpacing: '0.4px',
                            whiteSpace: 'nowrap',
                          }}>
                            <StatusIcon size={12} strokeWidth={2.5} />
                            {sm.label}
                          </span>
                        </td>

                        {/* NAYA: Submission column */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              backgroundColor: subM.bg, color: subM.text,
                              padding: '3px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
                              border: `1px solid ${subM.border}44`, whiteSpace: 'nowrap', width: 'fit-content',
                            }}>
                              <Clock size={11} strokeWidth={2.5} />
                              {subM.label}
                            </span>
                            {insp.submission?.caseNumber && (
                              <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                                {insp.submission.caseNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={13} color="var(--muted)" />
                            {insp.createdAt
                              ? new Date(insp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'N/A'}
                          </div>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <button
                            id={`view-btn-${insp._id}`}
                            onClick={() => setSelected(isOpen ? null : insp)}
                            style={{
                              backgroundColor: isOpen ? 'var(--navy)' : 'var(--surface)',
                              color: isOpen ? '#FFFFFF' : 'var(--navy)',
                              border: '1px solid var(--navy)',
                              borderRadius: '7px',
                              padding: '6px 14px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.18s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: isOpen ? '0 2px 8px rgba(22,36,71,0.2)' : 'none',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                              if (!isOpen) {
                                e.currentTarget.style.backgroundColor = 'var(--navy)';
                                e.currentTarget.style.color = '#FFFFFF';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isOpen) {
                                e.currentTarget.style.backgroundColor = 'var(--surface)';
                                e.currentTarget.style.color = 'var(--navy)';
                              }
                            }}
                          >
                            {isOpen ? (
                              <><Eye size={14} /> Viewing Report</>
                            ) : (
                              <><Eye size={14} /> View Audit Report</>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── 3. Modern Slide-Over Audit Report Drawer Overlay ───────────────────── */}
      {selected && (() => {
        const sm = statusMeta(selected.status);
        const subM = submissionMeta(selected.submission?.status);
        const StatusIcon = sm.Icon;

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              animation: 'drawerFadeIn 0.22s ease-out',
            }}
            onClick={() => {
              setSelected(null);
              setShowSeizureForm(false);
            }}
          >
            <style>{`
              @keyframes drawerFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes drawerSlideLeft {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>

            <div
              style={{
                width: '100%',
                maxWidth: '820px',
                height: '100%',
                backgroundColor: 'var(--surface, #ffffff)',
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'drawerSlideLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '20px 24px',
                  backgroundColor: 'var(--surface, #ffffff)',
                  borderBottom: '1px solid var(--border)',
                  borderTop: `4px solid ${sm.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  zIndex: 10,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                      {selected.productName || 'Inspection Detail'}
                    </h2>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      backgroundColor: sm.bg, color: sm.text,
                      padding: '3px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                      border: `1px solid ${sm.border}44`, whiteSpace: 'nowrap',
                    }}>
                      <StatusIcon size={13} strokeWidth={2.5} />
                      {sm.label}
                    </span>
                    {/* NAYA: Submission status badge drawer header mein */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      backgroundColor: subM.bg, color: subM.text,
                      padding: '3px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                      border: `1px solid ${subM.border}44`, whiteSpace: 'nowrap',
                    }}>
                      <Clock size={12} strokeWidth={2.5} />
                      {subM.label}
                    </span>
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>Audit ID: <strong style={{ color: 'var(--ink)', fontFamily: 'monospace' }}>#{selected._id.substring(selected._id.length - 8).toUpperCase()}</strong></span>
                    <span>•</span>
                    <span>Inspected: {new Date(selected.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    {selected.submission?.caseNumber && (
                      <>
                        <span>•</span>
                        <span>Case No: <strong style={{ color: 'var(--teal)' }}>{selected.submission.caseNumber}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <button
                    id={`download-report-btn-${selected._id}`}
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      window.open(
                        `${API_BASE_URL}/reports/generate/${selected._id}?token=${token}`,
                        '_blank'
                      );
                    }}
                    style={{
                      backgroundColor: 'var(--teal)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(15,110,86,0.25)',
                      transition: 'all 0.18s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--teal)')}
                  >
                    <Download size={14} />
                    Download PDF
                  </button>

                  <button
                    onClick={() => {
                      setSelected(null);
                      setShowSeizureForm(false);
                    }}
                    title="Close (Esc)"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--danger-light)';
                      e.currentTarget.style.color = 'var(--danger)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg)';
                      e.currentTarget.style.color = 'var(--ink)';
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {/* NAYA: Sent-back admin remarks callout, sabse upar taaki officer turant dekh le */}
                {selected.submission?.status === 'sent_back' && selected.submission?.adminRemarks && (
                  <div style={{
                    padding: '14px 18px',
                    border: '1px solid var(--danger)44',
                    borderRadius: '12px',
                    backgroundColor: 'var(--danger-light)',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}>
                    <AlertTriangle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--danger)', marginBottom: '3px' }}>
                        Sent Back by Admin — Needs Correction
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--ink)' }}>
                        {selected.submission.adminRemarks}
                      </div>
                    </div>
                  </div>
                )}

                {/* NAYA: Approved confirmation callout */}
                {selected.submission?.status === 'approved' && (
                  <div style={{
                    padding: '14px 18px',
                    border: '1px solid var(--teal)44',
                    borderRadius: '12px',
                    backgroundColor: 'var(--teal-light)',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                  }}>
                    <CheckCircle2 size={18} color="var(--teal)" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--teal)' }}>
                      Approved by admin
                      {selected.submission.reviewedAt && (
                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>
                          {' '}on {new Date(selected.submission.reviewedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {' '}— this is now an official record.
                    </div>
                  </div>
                )}

                {/* NAYA: Submit Record button for unsubmitted products */}
                {(!selected.submission?.status || selected.submission.status === 'draft' || selected.submission.status === 'sent_back') && (
                  <div>
                    <button
                      onClick={() => handleSubmitForRecord(selected._id)}
                      disabled={submitting}
                      style={{
                        backgroundColor: submitting ? 'var(--muted)' : 'var(--teal)',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: submitting ? 'none' : '0 2px 8px rgba(15,110,86,0.25)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--navy)'; }}
                      onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = 'var(--teal)'; }}
                    >
                      {submitting ? (
                        <>
                          <Clock size={15} style={{ animation: 'spin 1s linear infinite' }} />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={15} />
                          {selected.submission?.status === 'sent_back' ? 'Resubmit for Record' : 'Submit for Record'}
                        </>
                      )}
                    </button>
                    {submitError && (
                      <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '8px', fontWeight: 600 }}>
                        {submitError}
                      </p>
                    )}
                  </div>
                )}

                {selected.status === 'fail' && !selected.seizureMemo?.samplesSeized && (
                  <div>
                    <button
                      id="generate-seizure-memo-btn"
                      onClick={() => setShowSeizureForm(true)}
                      style={{
                        backgroundColor: 'var(--danger, #dc2626)',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(220,38,38,0.25)',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <AlertTriangle size={15} />
                      Generate Seizure Memo
                    </button>
                  </div>
                )}

                {selected.seizureMemo?.samplesSeized != null && (
                  <div
                    style={{
                      padding: '16px 20px',
                      border: '1px solid var(--danger, #dc2626)44',
                      borderRadius: '12px',
                      backgroundColor: 'var(--danger-light, #fef2f2)',
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 800, color: 'var(--danger, #dc2626)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} /> Official Seizure Memo
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px', color: 'var(--ink)' }}>
                      <p style={{ margin: 0 }}><strong>Samples Seized:</strong> {selected.seizureMemo.samplesSeized}</p>
                      <p style={{ margin: 0 }}><strong>Samples Released:</strong> {selected.seizureMemo.samplesReleased}</p>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--ink)' }}>
                      <strong>Disposal Note:</strong> {selected.seizureMemo.disposalNote}
                    </p>
                    {selected.seizureMemo.reasonsToBelieve && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                        <strong>Reasons to Believe:</strong> {selected.seizureMemo.reasonsToBelieve}
                      </p>
                    )}
                  </div>
                )}

                {showSeizureForm && (
                  <form
                    onSubmit={handleSeizureSubmit}
                    style={{
                      padding: '20px',
                      border: '1px solid var(--border, #cbd5e1)',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg, #f8fafc)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--navy)' }}>
                      Generate Seizure Memo
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>Samples Seized</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={seizureForm.samplesSeized}
                          onChange={(e) => setSeizureForm({ ...seizureForm, samplesSeized: e.target.value })}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            fontSize: '13px',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>Samples Released</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={seizureForm.samplesReleased}
                          onChange={(e) => setSeizureForm({ ...seizureForm, samplesReleased: e.target.value })}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            fontSize: '13px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>Disposal Note</label>
                      <textarea
                        required
                        value={seizureForm.disposalNote}
                        onChange={(e) => setSeizureForm({ ...seizureForm, disposalNote: e.target.value })}
                        placeholder="e.g. Samples to be disposed as per applicable procedure after investigation"
                        rows={3}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          fontSize: '13px',
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>Reasons to Believe (recommended)</label>
                      <textarea
                        value={seizureForm.reasonsToBelieve}
                        onChange={(e) => setSeizureForm({ ...seizureForm, reasonsToBelieve: e.target.value })}
                        placeholder="e.g. Consumer Care declaration missing, MRP mismatch observed on physical inspection"
                        rows={3}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          fontSize: '13px',
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button
                        type="submit"
                        disabled={seizureSubmitting}
                        style={{
                          backgroundColor: 'var(--navy)',
                          color: '#ffffff',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        {seizureSubmitting ? 'Saving...' : 'Save Seizure Memo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSeizureForm(false)}
                        style={{
                          backgroundColor: 'var(--surface)',
                          color: 'var(--ink)',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <EvidencePanel
                  extractedData={selected.extractedData}
                  violations={selected.violations}
                  imageUrl={selected.images?.[0]}
                />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default History;
