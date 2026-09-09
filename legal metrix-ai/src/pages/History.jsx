import { useEffect, useState } from 'react';
import API from '../api/axios';
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

function History() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #1c2b50 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        color: '#FFFFFF',
        marginBottom: '28px',
        boxShadow: '0 8px 24px rgba(22,36,71,0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.12)', padding: '4px 12px',
            borderRadius: '99px', fontSize: '12px', fontWeight: 600, marginBottom: '10px'
          }}>
            <ShieldCheck size={14} color="var(--teal-light)" />
            Official Metrology Audit Logs
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Inspection History & Audit Trail
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Complete historical record of all scanned products, AI evidence extractions, and compliance status.
          </p>
        </div>

        {/* Audit Stats Counter Pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 700 }}>Total Logs</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{total}</div>
          </div>
          <div style={{
            backgroundColor: 'rgba(15,110,86,0.3)', padding: '8px 16px', borderRadius: '10px',
            border: '1px solid var(--teal)', textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--teal-light)', textTransform: 'uppercase', fontWeight: 700 }}>Compliant</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{passed}</div>
          </div>
          <div style={{
            backgroundColor: 'rgba(163,45,45,0.3)', padding: '8px 16px', borderRadius: '10px',
            border: '1px solid var(--danger)', textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: '#FCA5A5', textTransform: 'uppercase', fontWeight: 700 }}>Violations</div>
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
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: '#FCFDFD',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
            <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search product name, officer, or ID..."
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

          {/* Filter tabs */}
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
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: statusFilter === tab.id ? 700 : 500,
                  backgroundColor: statusFilter === tab.id ? 'var(--surface)' : 'transparent',
                  color: statusFilter === tab.id ? 'var(--navy)' : 'var(--muted)',
                  cursor: 'pointer',
                  boxShadow: statusFilter === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--navy)' }}>
                  {['Product Item', 'Inspector Officer', 'Score', 'Status', 'Audit Date', 'Action'].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.85)',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        textAlign: i === 5 ? 'right' : 'left',
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
                      {/* Product details & thumbnail */}
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

                      {/* Inspector */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                          <User size={14} color="var(--muted)" />
                          {insp.officer?.name || 'Authorized Inspector'}
                        </div>
                      </td>

                      {/* Score */}
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

                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          backgroundColor: sm.bg, color: sm.text,
                          padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                          border: `1px solid ${sm.border}44`, letterSpacing: '0.4px',
                        }}>
                          <StatusIcon size={12} strokeWidth={2.5} />
                          {sm.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} color="var(--muted)" />
                          {insp.createdAt
                            ? new Date(insp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A'}
                        </div>
                      </td>

                      {/* Action */}
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
                            <><ChevronUp size={14} /> Hide Audit Report</>
                          ) : (
                            <><ChevronDown size={14} /> View Audit Report</>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 3. Detailed Audit Report Panel ───────────────────── */}
      {selected && (() => {
        const sm = statusMeta(selected.status);
        const StatusIcon = sm.Icon;

        return (
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderTop: `4px solid ${sm.border}`,
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 8px 30px rgba(22,36,71,0.1)',
            animation: 'fadeIn 0.25s ease-in-out',
          }}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

            {/* Header of selected audit */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '16px', paddingBottom: '20px',
              borderBottom: '1px solid var(--border)', marginBottom: '24px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                    {selected.productName || 'Inspection Detail'}
                  </h2>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    backgroundColor: sm.bg, color: sm.text,
                    padding: '4px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
                    border: `1px solid ${sm.border}44`
                  }}>
                    <StatusIcon size={14} strokeWidth={2.5} />
                    {sm.label}
                  </span>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
                  Audit Reference ID: <strong style={{ color: 'var(--ink)', fontFamily: 'monospace' }}>{selected._id}</strong>
                  &nbsp;·&nbsp; Inspected on {new Date(selected.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  id={`download-report-btn-${selected._id}`}
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    window.open(
                      `http://localhost:5000/api/reports/generate/${selected._id}?token=${token}`,
                      '_blank'
                    );
                  }}
                  style={{
                    backgroundColor: 'var(--teal)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(15,110,86,0.25)',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--teal)')}
                >
                  <Download size={15} />
                  Download Report
                </button>

                <button
                  onClick={() => setSelected(null)}
                  style={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  Close Report
                </button>
              </div>
            </div>

            {/* Evidence Breakdown */}
            <EvidencePanel
              extractedData={selected.extractedData}
              violations={selected.violations}
              imageUrl={selected.images?.[0]}
            />
          </div>
        );
      })()}
    </div>
  );
}

export default History;