import { useState } from 'react';
import API from '../api/axios';
import EvidencePanel from '../components/EvidencePanel';
import {
  ScanLine,
  AlertCircle,
  Loader2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  FileText,
  RotateCcw,
  Tag,
  Info,
} from 'lucide-react';

const statusStyle = (status) => ({
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

function ScanProduct() {
  const [productName, setProductName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  // now object: { type, title, message, suggestion }
  const [dragActive, setDragActive] = useState(false);

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    } else if (file) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const getErrorInfo = (err) => {
    const status = err.response?.status;
    const serverMsg = err.response?.data?.message;
    if (!err.response) return {
      type: 'network',
      title: 'Connection Failed',
      message: 'Unable to reach the server. Please check your internet connection.',
      suggestion: 'Make sure the backend server is running on the correct port and try again.',
    };
    if (status === 401 || status === 403) return {
      type: 'auth',
      title: 'Session Expired',
      message: 'Your login session has expired or the token is invalid.',
      suggestion: 'Please log out and sign in again to continue.',
    };
    if (status === 413) return {
      type: 'image',
      title: 'Image Too Large',
      message: 'The uploaded image exceeds the maximum allowed file size.',
      suggestion: 'Compress the image or use a photo under 5MB.',
    };
    if (status === 422 || serverMsg?.toLowerCase().includes('image')) return {
      type: 'image',
      title: 'Image Quality Issue',
      message: serverMsg || 'AI could not extract text from this image clearly.',
      suggestion: 'Use a well-lit, high-resolution, forward-facing photo of the product label.',
    };
    if (status >= 500) return {
      type: 'server',
      title: 'AI Engine Error',
      message: serverMsg || 'The AI analysis engine encountered an internal error.',
      suggestion: 'This is a server-side issue. Please wait a moment and try again.',
    };
    return {
      type: 'unknown',
      title: 'Analysis Failed',
      message: serverMsg || 'An unexpected error occurred during analysis.',
      suggestion: 'Ensure the image is clear and product name is correct, then retry.',
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!image) {
      setError({
        type: 'validation',
        title: 'No Image Selected',
        message: 'A product packaging photo is required to run the compliance check.',
        suggestion: 'Click the upload area or drag & drop a clear photo of the product label.',
      });
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('image', image);

    try {
      const response = await API.post('/inspections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.inspection);
    } catch (err) {
      setError(getErrorInfo(err));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductName('');
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const st = result ? statusStyle(result.status) : null;

  return (
    <div style={{ paddingBottom: '50px' }}>
      {/* ── 1. Page Header Banner ────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #173256 60%, #0F6E56 100%)',
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
            <Sparkles size={14} color="var(--teal-light)" />
            AI Computer Vision Scanner
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Automated Product Inspection
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
            Upload package photos to extract mandatory declarations and check compliance against Indian Legal Metrology Rules.
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <ShieldCheck size={20} color="var(--teal-light)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
            5 Mandatory Rules Ready
          </span>
        </div>
      </div>

      {/* ── 2. Two-Column Layout (Form + Guidelines) ───────────── */}
      {loading && (
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes pulse-ring {
            0% { transform: scale(0.85); opacity: 0.7; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(0.85); opacity: 0.7; }
          }
          @keyframes step-slide {
            0% { opacity: 0; transform: translateX(-10px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
          @keyframes dot-bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      )}

      {!result ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Left Column — Form or Loading Overlay */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: loading ? '1px solid rgba(15,110,86,0.3)' : '1px solid var(--border)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: loading ? '0 0 0 3px rgba(15,110,86,0.08), 0 8px 30px rgba(22,36,71,0.1)' : '0 2px 10px rgba(22,36,71,0.04)',
            transition: 'all 0.4s ease',
            position: 'relative',
            overflow: 'hidden',
          }}>

            {/* ── AI LOADING OVERLAY ── */}
            {loading && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 10,
                background: 'linear-gradient(160deg, #f0faf6 0%, #eef2ff 60%, #fafafa 100%)',
                borderRadius: '16px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '24px', padding: '32px',
              }}>

                {/* Animated Scan Ring */}
                <div style={{ position: 'relative', width: '96px', height: '96px' }}>
                  {/* Outer pulse ring */}
                  <div style={{
                    position: 'absolute', inset: '-10px',
                    borderRadius: '50%',
                    border: '2px solid rgba(15,110,86,0.2)',
                    animation: 'pulse-ring 2s ease-in-out infinite',
                  }} />
                  {/* Spinning arc */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: 'var(--teal)',
                    borderRightColor: 'rgba(15,110,86,0.3)',
                    animation: 'spin 1s linear infinite',
                  }} />
                  {/* Inner core */}
                  <div style={{
                    position: 'absolute', inset: '12px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a6b 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(22,36,71,0.3)',
                  }}>
                    <ScanLine size={26} color="#ffffff" strokeWidth={2} />
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                    AI Analysis In Progress
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', margin: 0 }}>
                    Gemini Vision is scanning your product
                  </p>
                </div>

                {/* Processing Steps */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Image Received & Pre-processed', delay: '0s' },
                    { label: 'OCR Text Extraction Running…', delay: '0.4s' },
                    { label: 'Legal Rule Engine Checking…', delay: '0.8s' },
                    { label: 'Compliance Report Generating…', delay: '1.2s' },
                  ].map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(15,110,86,0.15)',
                      borderRadius: '8px', padding: '8px 12px',
                      animation: `step-slide 0.4s ease forwards`,
                      animationDelay: step.delay,
                      opacity: 0,
                    }}>
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        backgroundColor: 'var(--teal)',
                        animation: `dot-bounce 1.4s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shimmer bar */}
                <div style={{
                  width: '100%', height: '4px', borderRadius: '99px',
                  background: 'linear-gradient(90deg, var(--teal-light) 25%, var(--teal) 50%, var(--teal-light) 75%)',
                  backgroundSize: '400px 100%',
                  animation: 'shimmer 1.6s ease-in-out infinite',
                }} />
              </div>
            )}
            {/* ── END LOADING OVERLAY ── */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Product Name */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                  <Tag size={15} color="var(--navy)" />
                  Product Name / Title
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Dove Shampoo 650ml / Aashirvaad Atta"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '14px',
                    color: 'var(--ink)',
                    backgroundColor: 'var(--surface)',
                    outline: 'none',
                    transition: 'all 0.18s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--teal)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(15,110,86,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Drag & Drop Upload Zone */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                  <Upload size={15} color="var(--navy)" />
                  Package Photo Upload
                </label>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('product-image').click()}
                  style={{
                    border: `2px dashed ${dragActive ? 'var(--teal)' : preview ? 'var(--teal)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    backgroundColor: dragActive ? 'var(--teal-light)' : preview ? '#F4FBF8' : 'var(--bg)',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    style={{ display: 'none' }}
                  />

                  {preview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={preview}
                        alt="Preview"
                        style={{
                          maxHeight: '160px',
                          maxWidth: '100%',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600 }}>
                        ✓ Photo selected (Click or drag to replace)
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        backgroundColor: 'var(--teal-light)', color: 'var(--teal)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Upload size={22} strokeWidth={2.2} />
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                        Click to browse or drop package photo here
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                        Supports JPG, PNG, WEBP (Clear, well-lit photo recommended)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Error Card */}
              {error && (
                <div style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: `1px solid ${
                    error.type === 'network' ? '#C84B31' :
                    error.type === 'auth'    ? 'var(--amber)' :
                    error.type === 'image'   ? '#6B4EFF' :
                    error.type === 'server'  ? 'var(--danger)' :
                    'var(--danger)'
                  }44`,
                  animation: 'step-slide 0.3s ease forwards',
                }}>
                  {/* Colored top bar */}
                  <div style={{
                    height: '4px',
                    background: (
                      error.type === 'network' ? 'linear-gradient(90deg, #C84B31, #E8735A)' :
                      error.type === 'auth'    ? 'linear-gradient(90deg, var(--amber), #E8A83A)' :
                      error.type === 'image'   ? 'linear-gradient(90deg, #6B4EFF, #9B78FF)' :
                      error.type === 'server'  ? 'linear-gradient(90deg, var(--danger), #C84040)' :
                      'linear-gradient(90deg, var(--danger), #C84040)'
                    ),
                  }} />
                  <div style={{
                    backgroundColor: 'var(--danger-light)',
                    padding: '14px 16px',
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                  }}>
                    {/* Icon bubble */}
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                      backgroundColor: (
                        error.type === 'network' ? '#C84B3120' :
                        error.type === 'auth'    ? 'var(--amber-light)' :
                        error.type === 'image'   ? '#6B4EFF18' :
                        'var(--danger-light)'
                      ),
                      border: `1px solid ${
                        error.type === 'network' ? '#C84B3130' :
                        error.type === 'auth'    ? 'var(--amber)44' :
                        error.type === 'image'   ? '#6B4EFF30' :
                        'var(--danger)30'
                      }`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <AlertCircle size={18} color={
                        error.type === 'network' ? '#C84B31' :
                        error.type === 'auth'    ? 'var(--amber)' :
                        error.type === 'image'   ? '#6B4EFF' :
                        'var(--danger)'
                      } strokeWidth={2.2} />
                    </div>

                    {/* Text content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink)', marginBottom: '3px' }}>
                        {error.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '8px' }}>
                        {error.message}
                      </div>
                      {error.suggestion && (
                        <div style={{
                          display: 'flex', alignItems: 'flex-start', gap: '6px',
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(22,36,71,0.08)',
                          borderRadius: '8px', padding: '8px 10px',
                        }}>
                          <span style={{ fontSize: '13px', lineHeight: 1 }}>💡</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.5 }}>
                            {error.suggestion}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dismiss button */}
                    <button
                      onClick={() => setError(null)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--muted)', fontSize: '18px', lineHeight: 1,
                        padding: '0', flexShrink: 0, fontWeight: 300,
                      }}
                    >×</button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="analyze-btn"
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? 'var(--muted)' : 'var(--navy)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(22,36,71,0.25)',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--teal)'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--navy)'; }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <ScanLine size={18} />
                    Analyze Product Compliance
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column — Guidelines & Inspection Checklist */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 2px 10px rgba(22,36,71,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} color="var(--teal)" />
                What Gemini AI Verifies
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                Our vision model analyzes the uploaded packaging photo and checks 5 critical Legal Metrology declarations:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { title: 'Maximum Retail Price (MRP)', desc: 'Must include ₹ currency symbol and all taxes statement.' },
                  { title: 'Net Quantity', desc: 'Must declare weight/volume in standard metric units (g, kg, ml, L).' },
                  { title: 'Manufacturer Details', desc: 'Name and registered address of manufacturer/packer.' },
                  { title: 'Consumer Care Contact', desc: 'Helpline number or email for consumer complaints.' },
                  { title: 'Manufacturing / Packing Date', desc: 'Month and year of manufacture or packing.' },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                    backgroundColor: 'var(--bg)', padding: '10px 14px', borderRadius: '10px',
                    border: '1px solid var(--border)',
                  }}>
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      backgroundColor: 'var(--teal)', color: '#FFF',
                      fontSize: '11px', fontWeight: 700, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted)'
            }}>
              <ShieldCheck size={16} color="var(--teal)" />
              All inspections are logged for official audit trails.
            </div>
          </div>
        </div>
      ) : (
        /* ── 3. Inspection Result Showcase ────────────────────── */
        st && (
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderTop: `5px solid ${st.border}`,
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 8px 30px rgba(22,36,71,0.08)',
            animation: 'fadeIn 0.3s ease-in-out',
          }}>
            {/* Header Result Bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '16px', marginBottom: '24px', paddingBottom: '20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                    {result.productName || 'Inspection Result'}
                  </h2>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    backgroundColor: st.bg, color: st.text,
                    padding: '5px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 800,
                    border: `1px solid ${st.border}44`, letterSpacing: '0.5px'
                  }}>
                    {st.Icon && <st.Icon size={16} strokeWidth={2.5} />}
                    {st.label}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', margin: 0 }}>
                  Inspection ID: <strong style={{ color: 'var(--ink)', fontFamily: 'monospace' }}>{result._id}</strong>
                </p>
              </div>

              <button
                onClick={resetForm}
                style={{
                  backgroundColor: 'var(--navy)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--teal)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy)')}
              >
                <RotateCcw size={15} />
                Scan Another Product
              </button>
            </div>

            {/* Evidence Panel component */}
            <EvidencePanel
              extractedData={result.extractedData}
              violations={result.violations}
              imageUrl={result.images?.[0]}
            />
          </div>
        )
      )}
    </div>
  );
}

export default ScanProduct;