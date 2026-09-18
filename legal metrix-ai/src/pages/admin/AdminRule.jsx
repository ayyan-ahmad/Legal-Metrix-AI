import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Plus, Trash2, Edit2, X, Settings2, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Scale } from 'lucide-react';

function AdminRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [ruleToDelete, setRuleToDelete] = useState(null); // Stores the rule object to delete

  const emptyForm = { ruleId: '', field: '', label: '', required: true, severity: 'high', description: '' };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await API.get('/rules');
      setRules(res.data.rules);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openCreateForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (rule) => {
    setFormData({
      ruleId: rule.ruleId,
      field: rule.field,
      label: rule.label,
      required: rule.required,
      severity: rule.severity,
      description: rule.description || '',
    });
    setEditingId(rule._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.patch(`/rules/${editingId}`, formData);
      } else {
        await API.post('/rules', formData);
      }
      setShowForm(false);
      fetchRules();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDeleteClick = (rule) => {
    setRuleToDelete(rule);
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    try {
      await API.delete(`/rules/${ruleToDelete._id}`);
      setRuleToDelete(null);
      fetchRules();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getSeverityBadge = (sev) => {
    if (sev === 'high') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, border: '1px solid var(--danger)33' }}>
          <ShieldAlert size={12} /> HIGH
        </span>
      );
    }
    if (sev === 'medium') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--amber-light)', color: 'var(--amber)', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, border: '1px solid var(--amber)33' }}>
          <AlertTriangle size={12} /> MEDIUM
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--teal-light)', color: 'var(--teal)', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, border: '1px solid var(--teal)33' }}>
        <CheckCircle2 size={12} /> LOW
      </span>
    );
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      {/* ── Custom Delete Confirmation Modal ─────────────────────────────── */}
      {ruleToDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          backgroundColor: 'rgba(11,25,46,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div className="w-[90%] sm:w-full max-w-[420px] p-5 sm:p-7 relative rounded-2xl" style={{
            backgroundColor: 'var(--surface)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'scaleUp 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <style>{`
              @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
            
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: 'var(--danger-light)', color: 'var(--danger)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Trash2 size={28} />
            </div>
            
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 800, color: 'var(--navy)' }}>
              Delete Rule?
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5' }}>
              Are you sure you want to delete the rule <strong>{ruleToDelete.ruleId}</strong> ({ruleToDelete.label})? 
              This will permanently remove it from the AI Policy Engine and affect all future compliance scans.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRuleToDelete(null)}
                style={{
                  padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                  backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink)',
                  cursor: 'pointer', transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--border)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                  backgroundColor: 'var(--danger)', border: 'none', color: '#FFF',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)', transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Trash2 size={15} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
            <Scale size={13} color="var(--amber-light)" />
            AI Policy Engine
          </div>
          <h1 className="text-2xl md:text-[28px] font-extrabold m-0 tracking-tight" style={{ color: '#FFFFFF' }}>
            Compliance Rules
          </h1>
          <p className="text-sm md:text-[14px] m-0 max-w-[520px] mt-1.5" style={{ color: 'rgba(255,255,255,0.78)' }}>
            Configure the specific checks the AI performs on product packaging. Changes here instantly update the scanning engine.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="w-full md:w-auto px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm mt-2 md:mt-0 relative z-10"
          style={{
            backgroundColor: 'var(--amber)', color: '#0b192e',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(181,114,15,0.35)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Plus size={18} /> Add New Rule
        </button>
      </div>

      {error && <div style={{ padding: '16px', color: 'var(--danger)', backgroundColor: 'var(--danger-light)', borderRadius: '12px', marginBottom: '20px', fontWeight: 600 }}>{error}</div>}

      {/* ── Create/Edit Form ──────────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 mb-7 relative" style={{
          backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-[var(--border)]">
            <h3 className="flex items-center gap-2 m-0 text-base sm:text-lg font-extrabold" style={{ color: 'var(--navy)' }}>
              <Settings2 size={20} color="var(--amber)" />
              {editingId ? 'Edit AI Rule Configuration' : 'Create AI Rule Configuration'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="shrink-0 flex items-center justify-center rounded-full transition-all cursor-pointer" style={{ background: 'var(--bg)', border: '1px solid var(--border)', width: '32px', height: '32px', color: 'var(--muted)' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--border)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}>
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label style={labelStyle}>Rule ID (Unique)</label>
              <input
                name="ruleId" placeholder="e.g. mrp_001"
                value={formData.ruleId} onChange={handleChange} required disabled={!!editingId}
                style={{ ...inputStyle, backgroundColor: editingId ? 'var(--bg)' : '#FFF' }}
              />
            </div>
            <div>
              <label style={labelStyle}>AI Extraction Field</label>
              <input
                name="field" placeholder="e.g. mrp"
                value={formData.field} onChange={handleChange} required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Display Label</label>
              <input
                name="label" placeholder="e.g. MRP Declaration"
                value={formData.label} onChange={handleChange} required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Severity Level</label>
              <select name="severity" value={formData.severity} onChange={handleChange} style={inputStyle}>
                <option value="low">Low (Information Only)</option>
                <option value="medium">Medium (Warning)</option>
                <option value="high">High (Critical Violation)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Rule Description & Instructions for AI</label>
            <textarea
              name="description" placeholder="Explain what the AI should look for..."
              value={formData.description} onChange={handleChange}
              style={{ ...inputStyle, width: '100%', minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer" style={{ color: 'var(--ink)' }}>
              <input type="checkbox" name="required" checked={formData.required} onChange={handleChange} className="w-[18px] h-[18px] shrink-0" style={{ accentColor: 'var(--amber)' }} />
              Must be present to pass compliance
            </label>

            <button type="submit" className="w-full sm:w-auto px-7 py-3 rounded-[10px] flex items-center justify-center gap-2 text-sm font-bold cursor-pointer transition-all text-white" style={{
              backgroundColor: 'var(--navy)', border: 'none',
            }}>
              {editingId ? <><Edit2 size={16} /> Save Changes</> : <><Plus size={16} /> Create Rule</>}
            </button>
          </div>
        </form>
      )}

      {/* ── Rules Table Container ─────────────────────────────────────────── */}
      <div style={{
        backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', boxShadow: '0 2px 10px rgba(22,36,71,0.04)', overflow: 'hidden',
      }}>
        <div className="p-4 sm:p-[20px_24px] flex justify-between items-center" style={{
          borderBottom: '1px solid var(--border)', backgroundColor: '#FCFDFD',
        }}>
          <div>
            <h3 className="text-base sm:text-[17px] font-bold m-0" style={{ color: 'var(--navy)' }}>Active Rules Directory</h3>
            <p className="text-xs sm:text-[13px] mt-0.5 mb-0" style={{ color: 'var(--muted)' }}>
              {rules.length} rules currently being enforced by the Gemini engine.
            </p>
          </div>
        </div>

        <div className="block sm:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px', fontWeight: 500 }}>
              Loading rules...
            </div>
          ) : rules.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <Settings2 size={36} color="var(--border)" style={{ marginBottom: '12px', display: 'inline-block' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>No AI rules configured</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Add your first rule to instruct the AI.</p>
            </div>
          ) : (
            rules.map((rule, idx) => (
              <div
                key={rule._id}
                style={{
                  padding: '16px',
                  backgroundColor: idx % 2 === 0 ? 'var(--surface)' : '#FAFCFB',
                  transition: 'background 0.15s ease',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)' }}>
                      {rule.label}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--navy)', fontWeight: 600, marginTop: '2px' }}>
                      {rule.ruleId}
                    </div>
                  </div>
                  {getSeverityBadge(rule.severity)}
                </div>

                <div className="flex items-center gap-4 flex-wrap mb-4">
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Field</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 500 }}>
                      {rule.field}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Required</div>
                    <div style={{ fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {rule.required ? (
                        <><CheckCircle2 size={12} color="var(--teal)" /> <span style={{ color: 'var(--teal)' }}>Yes</span></>
                      ) : (
                        <><XCircle size={12} color="var(--muted)" /> <span style={{ color: 'var(--muted)' }}>No</span></>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(rule)}
                    style={{ ...iconBtnStyle, flex: 1, height: '36px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--amber-light)'; e.currentTarget.style.color = 'var(--amber)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg)'; e.currentTarget.style.color = 'var(--navy)'; }}
                  >
                    <Edit2 size={16} /> <span style={{ marginLeft: '6px', fontSize: '13px', fontWeight: 600 }}>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(rule)}
                    style={{ ...iconBtnStyle, flex: 1, height: '36px', color: 'var(--danger)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--danger-light)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg)'; }}
                  >
                    <Trash2 size={16} /> <span style={{ marginLeft: '6px', fontSize: '13px', fontWeight: 600 }}>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden sm:block" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Rule ID', 'Label (Field)', 'Severity', 'Required', 'Actions'].map((h, i) => (
                  <th key={h} style={{ ...thStyle, textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 500 }}>Loading rules...</div>
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <Settings2 size={36} color="var(--border)" style={{ marginBottom: '12px', display: 'inline-block' }} />
                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>No AI rules configured</p>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Add your first rule to instruct the AI.</p>
                  </td>
                </tr>
              ) : (
                rules.map((rule, idx) => (
                  <tr
                    key={rule._id}
                    style={{
                      borderBottom: idx < rules.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--navy)', fontWeight: 600 }}>
                      {rule.ruleId}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>{rule.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Field: {rule.field}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {getSeverityBadge(rule.severity)}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {rule.required ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--teal)', fontSize: '13px', fontWeight: 600 }}>
                          <CheckCircle2 size={16} /> Yes
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>
                          <XCircle size={16} /> No
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditForm(rule)}
                          style={iconBtnStyle}
                          title="Edit Rule"
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--amber-light)'; e.currentTarget.style.color = 'var(--amber)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg)'; e.currentTarget.style.color = 'var(--navy)'; }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(rule)}
                          style={{ ...iconBtnStyle, color: 'var(--danger)' }}
                          title="Delete Rule"
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--danger-light)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg)'; }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '12px 24px', fontSize: '12px',
  fontWeight: 700, color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

const labelStyle = {
  display: 'block', fontSize: '12px', fontWeight: 700,
  color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
};

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid var(--border)', fontSize: '14px',
  outline: 'none', transition: 'border-color 0.2s',
  backgroundColor: '#FFF'
};

const iconBtnStyle = {
  backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
  width: '32px', height: '32px', borderRadius: '8px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: 'var(--navy)', transition: 'all 0.2s',
};

export default AdminRules;