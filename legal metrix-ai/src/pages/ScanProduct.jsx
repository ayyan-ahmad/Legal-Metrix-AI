import { useState } from 'react';
import API from '../api/axios';
import EvidencePanel from '../components/EvidencePanel';
import CameraCapture from '../components/CameraCapture';
import {
  ScanLine,
  AlertCircle,
  Loader2,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Tag,
  Info,
  Camera as CameraIcon,
  FolderOpen,
  Plus,
  Trash2,
  Layers,
  ListPlus,
  IndianRupee,
  Scale,
  Building2,
  PhoneCall,
  Calendar,
  Image as ImageIcon,
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

const MAX_IMAGES = 5;

function ScanProduct() {
  const [productName, setProductName] = useState('');

  // Common state jo dono modes (gallery + camera) share karte hain
  const [images, setImages] = useState([]); // File objects ka array
  const [previews, setPreviews] = useState([]); // preview URLs (gallery mode ke liye)
  const [captureMode, setCaptureMode] = useState('gallery'); // 'gallery' | 'camera'

  const [result, setResult] = useState(null);
  const [imageWarnings, setImageWarnings] = useState(null); // partial-failure info (friend ka backend feature)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // ── Gallery se files add karna (multi-file, max 5 tak) ──
  const handleGalleryFiles = (fileList) => {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith('image/'));

    if (incoming.length === 0) {
      setError({
        type: 'validation',
        title: 'Invalid File',
        message: 'Please upload valid image files (JPG, PNG, WEBP).',
        suggestion: 'Try selecting a photo taken from your camera or gallery.',
      });
      return;
    }

    setImages((prev) => {
      const combined = [...prev, ...incoming].slice(0, MAX_IMAGES);
      setPreviews(combined.map((f) => URL.createObjectURL(f)));
      return combined;
    });
    setError(null);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setPreviews(updated.map((f) => URL.createObjectURL(f)));
      return updated;
    });
  };

  // ── Mode switch karte waqt purana data clear karo (confusion avoid karne ke liye) ──
  const switchMode = (mode) => {
    setCaptureMode(mode);
    setImages([]);
    setPreviews([]);
    setError(null);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleGalleryFiles(e.dataTransfer.files);
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

  // Batch Queue states
  const [batchQueue, setBatchQueue] = useState([]); // [{ id, productName, images, previews }]
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, currentName: '' });
  const [batchResults, setBatchResults] = useState([]); // Array of inspection objects
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [cameraResetKey, setCameraResetKey] = useState(0);

  // Add current product to batch queue
  const handleAddToQueue = (e) => {
    if (e) e.preventDefault();
    if (batchQueue.length >= 5) {
      setError({
        type: 'validation',
        title: 'Batch Queue Limit Reached (Max 5)',
        message: 'You can add a maximum of 5 products per batch inspection.',
        suggestion: 'Analyze the current 5 queued products or remove an item to add a new one.',
      });
      return;
    }
    if (!productName.trim()) {
      setError({
        type: 'validation',
        title: 'Product Name Required',
        message: 'Please enter a product name before adding it to the batch queue.',
        suggestion: 'Type a product title in the input box.',
      });
      return;
    }
    if (images.length === 0) {
      setError({
        type: 'validation',
        title: 'No Image Selected',
        message: 'Please upload or capture at least one photo for this product.',
        suggestion: 'Add packaging photos before clicking Add to Queue.',
      });
      return;
    }

    const newItem = {
      id: Date.now() + Math.random(),
      productName: productName.trim(),
      images: [...images],
      previews: [...previews],
    };

    setBatchQueue((prev) => [...prev, newItem].slice(0, 5));
    setProductName('');
    setImages([]);
    setPreviews([]);
    setCameraResetKey((prev) => prev + 1);
    setError(null);
  };

  const removeFromQueue = (id) => {
    setBatchQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearQueue = () => {
    setBatchQueue([]);
  };

  const analyzeAll = async (queueToProcess) => {
    if (!queueToProcess || queueToProcess.length === 0) return;

    // Strict safety cap: maximum 5 products sent to Gemini AI
    const safeQueue = queueToProcess.slice(0, 5);

    setError(null);
    setResult(null);
    setBatchResults([]);
    setImageWarnings(null);
    setLoading(true);

    const accumulatedResults = [];

    for (let i = 0; i < safeQueue.length; i++) {
      const item = safeQueue[i];
      setScanProgress({
        current: i + 1,
        total: safeQueue.length,
        currentName: item.productName,
      });

      const formData = new FormData();
      formData.append('productName', item.productName);
      item.images.forEach((img) => formData.append('images', img));

      try {
        const response = await API.post('/inspections', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const insp = response.data.inspection;
        accumulatedResults.push(insp);
        setResult(insp);
        setBatchResults([...accumulatedResults]);
        setImageWarnings(response.data.imageProcessingInfo || null);
      } catch (err) {
        setError(getErrorInfo(err));
        break;
      }

      // Har product ke baad thoda ruko (rate limit & server stability ke liye)
      if (i < safeQueue.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    setLoading(false);
    setScanProgress({ current: 0, total: 0, currentName: '' });
    return accumulatedResults;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let finalQueue = [...batchQueue];

    // Agar user ne inputs fill kar rakhe hain to launch ke waqt auto-add karo (max 5 limit)
    if (productName.trim() && images.length > 0) {
      if (finalQueue.length < 5) {
        const currentItem = {
          id: Date.now(),
          productName: productName.trim(),
          images: [...images],
          previews: [...previews],
        };
        finalQueue.push(currentItem);
        setBatchQueue(finalQueue);
        setProductName('');
        setImages([]);
        setPreviews([]);
      }
    }

    if (finalQueue.length === 0) {
      setError({
        type: 'validation',
        title: 'No Products to Scan',
        message: 'Please enter a product name and attach photos, or add products to the queue.',
        suggestion: 'Upload packaging photos and enter a title to run inspection.',
      });
      return;
    }

    await analyzeAll(finalQueue.slice(0, 5));
  };

  const resetForm = () => {
    setProductName('');
    setImages([]);
    setPreviews([]);
    setBatchQueue([]);
    setBatchResults([]);
    setSelectedResultIndex(0);
    setCaptureMode('gallery');
    setResult(null);
    setImageWarnings(null);
    setError(null);
  };

  const st = result ? statusStyle(result.status) : null;

  return (
    <div style={{ paddingBottom: '50px' }}>

      {/* ── 1. Modern Page Header Banner with Horizontal Rule Badges ────────────────────────────── */}
      <div
        className="!px-6 sm:!px-10 !py-7 sm:!py-8"
        style={{
          background: 'linear-gradient(135deg, #0b192e 0%, #162a45 45%, #0F6E56 100%)',
          borderRadius: '24px',
          color: '#FFFFFF',
          marginBottom: '28px',
          boxShadow: '0 12px 32px rgba(11,25,46,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,110,86,0.3) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.12)', padding: '5px 14px',
              borderRadius: '99px', fontSize: '12px', fontWeight: 700, marginBottom: '12px',
              border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
            }}>
              <Sparkles size={14} color="#5EEAD4" />
              AI Computer Vision Scanner v2.0
            </div>
            <h1 className="text-2xl sm:text-[28px]" style={{ fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
              Automated Product Inspection
            </h1>
            <p className="text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.8)', marginTop: '6px', margin: 0, maxWidth: '650px', lineHeight: 1.6 }}>
              Upload or capture package photos to extract mandatory declarations and check compliance against Indian Legal Metrology Rules.
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            backgroundColor: 'rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            flexShrink: 0,
          }}>
            <ShieldCheck size={22} color="#5EEAD4" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>5 MANDATORY RULES READY</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Legal Metrology Act, 2009</div>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', position: 'relative', zIndex: 10,
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '6px' }}>
            Gemini AI Verifies:
          </span>
          {[
            { label: 'MRP & Taxes', Icon: IndianRupee, title: 'Maximum Retail Price with tax statement' },
            { label: 'Net Quantity', Icon: Scale, title: 'Declared in standard metric units (g, kg, ml, L)' },
            { label: 'Mfg Details', Icon: Building2, title: 'Manufacturer / Packer Name & Address' },
            { label: 'Consumer Care', Icon: PhoneCall, title: 'Helpline Number & Complaint Email' },
            { label: 'Mfg / Packing Date', Icon: Calendar, title: 'Month and Year of Manufacture' },
          ].map((rule, idx) => (
            <span
              key={idx}
              title={rule.title}
              style={{
                fontSize: '12px', fontWeight: 600, color: '#FFFFFF',
                backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)',
                padding: '5px 13px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                backdropFilter: 'blur(6px)', transition: 'all 0.2s ease', cursor: 'default',
              }}
            >
              <rule.Icon size={13} color="#5EEAD4" />
              {rule.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Keyframe animations ── */}
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
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Spacious Main Form Container */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: loading ? '1px solid rgba(15,110,86,0.3)' : '1px solid var(--border)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: loading ? '0 0 0 3px rgba(15,110,86,0.08), 0 12px 40px rgba(22,36,71,0.1)' : '0 4px 20px rgba(22,36,71,0.05)',
            transition: 'all 0.4s ease',
            position: 'relative',
            overflow: 'hidden',
          }}>

            {/* ── AI LOADING OVERLAY ── */}
            {loading && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 10,
                background: 'linear-gradient(160deg, #f0faf6 0%, #eef2ff 60%, #fafafa 100%)',
                borderRadius: '20px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '24px', padding: '32px',
              }}>
                <div style={{ position: 'relative', width: '96px', height: '96px' }}>
                  <div style={{
                    position: 'absolute', inset: '-10px', borderRadius: '50%',
                    border: '2px solid rgba(15,110,86,0.2)',
                    animation: 'pulse-ring 2s ease-in-out infinite',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: 'var(--teal)',
                    borderRightColor: 'rgba(15,110,86,0.3)',
                    animation: 'spin 1s linear infinite',
                  }} />
                  <div style={{
                    position: 'absolute', inset: '12px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a6b 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(22,36,71,0.3)',
                  }}>
                    <ScanLine size={26} color="#ffffff" strokeWidth={2} />
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                    AI Analysis In Progress
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--teal)', marginTop: '4px', margin: 0 }}>
                    {scanProgress.total > 1
                      ? `Scanning product ${scanProgress.current} of ${scanProgress.total}: "${scanProgress.currentName}"`
                      : `Gemini Vision is scanning package label`}
                  </p>
                </div>

                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Images Received & Pre-processed', delay: '0s' },
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

                <div style={{
                  width: '100%', maxWidth: '400px', height: '4px', borderRadius: '99px',
                  background: 'linear-gradient(90deg, var(--teal-light) 25%, var(--teal) 50%, var(--teal-light) 75%)',
                  backgroundSize: '400px 100%',
                  animation: 'shimmer 1.6s ease-in-out infinite',
                }} />
              </div>
            )}
            {/* ── END LOADING OVERLAY ── */}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
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
                  placeholder="e.g. Dove Shampoo 650ml / Aashirvaad Atta 5kg"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
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

              {/* ── Photo Section: Mode Toggle + Gallery/Camera ── */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                  <Upload size={15} color="var(--navy)" />
                  Package Photos (up to {MAX_IMAGES})
                </label>

                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <button
                    type="button"
                    onClick={() => switchMode('gallery')}
                    style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px', borderRadius: '12px',
                      border: captureMode === 'gallery' ? '2px solid var(--teal)' : '1px solid var(--border)',
                      backgroundColor: captureMode === 'gallery' ? 'var(--teal-light)' : 'var(--surface)',
                      color: captureMode === 'gallery' ? 'var(--teal)' : 'var(--muted)',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <FolderOpen size={17} />
                    Upload from Gallery
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode('camera')}
                    style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px', borderRadius: '12px',
                      border: captureMode === 'camera' ? '2px solid var(--teal)' : '1px solid var(--border)',
                      backgroundColor: captureMode === 'camera' ? 'var(--teal-light)' : 'var(--surface)',
                      color: captureMode === 'camera' ? 'var(--teal)' : 'var(--muted)',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <CameraIcon size={17} />
                    Use Camera
                  </button>
                </div>

                {/* Gallery mode: drag-drop zone */}
                {captureMode === 'gallery' ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('product-image').click()}
                    style={{
                      border: `2px dashed ${dragActive ? 'var(--teal)' : previews.length > 0 ? 'var(--teal)' : 'var(--border)'}`,
                      borderRadius: '16px',
                      backgroundColor: dragActive ? 'var(--teal-light)' : previews.length > 0 ? '#F4FBF8' : 'var(--bg)',
                      padding: '32px 24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      id="product-image"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleGalleryFiles(e.target.files)}
                      style={{ display: 'none' }}
                    />

                    {previews.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {previews.map((src, i) => (
                            <div key={i} style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                              <img
                                src={src}
                                alt={`preview-${i}`}
                                style={{
                                  width: '90px', height: '90px', objectFit: 'cover',
                                  borderRadius: '10px', border: '1px solid var(--border)',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                style={{
                                  position: 'absolute', top: '-6px', right: '-6px',
                                  width: '22px', height: '22px', borderRadius: '50%',
                                  backgroundColor: 'var(--danger)', color: 'white', border: 'none',
                                  cursor: 'pointer', fontSize: '13px', lineHeight: 1,
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 700 }}>
                          ✓ {previews.length} photo{previews.length > 1 ? 's' : ''} selected — click to add more (max {MAX_IMAGES})
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '54px', height: '54px', borderRadius: '50%',
                          backgroundColor: 'var(--teal-light)', color: 'var(--teal)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Upload size={24} strokeWidth={2.2} />
                        </div>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                          Click to browse or drop package photos here
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                          Up to {MAX_IMAGES} photos — front label, back panel, MRP declarations recommended
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Camera mode (1 photo per product limit) */
                  <CameraCapture
                    onImagesChange={(files, prevs) => {
                      setImages(files);
                      if (prevs) setPreviews(prevs);
                    }}
                    maxImages={1}
                    resetKey={cameraResetKey}
                  />
                )}
              </div>

              {/* Premium Error Card */}
              {error && (
                <div style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: `1px solid ${error.type === 'network' ? '#C84B31' :
                      error.type === 'auth' ? 'var(--amber)' :
                        error.type === 'image' ? '#6B4EFF' :
                          error.type === 'server' ? 'var(--danger)' :
                            'var(--danger)'
                    }44`,
                  animation: 'step-slide 0.3s ease forwards',
                }}>
                  <div style={{
                    height: '4px',
                    background: (
                      error.type === 'network' ? 'linear-gradient(90deg, #C84B31, #E8735A)' :
                        error.type === 'auth' ? 'linear-gradient(90deg, var(--amber), #E8A83A)' :
                          error.type === 'image' ? 'linear-gradient(90deg, #6B4EFF, #9B78FF)' :
                            error.type === 'server' ? 'linear-gradient(90deg, var(--danger), #C84040)' :
                              'linear-gradient(90deg, var(--danger), #C84040)'
                    ),
                  }} />
                  <div style={{
                    backgroundColor: 'var(--danger-light)',
                    padding: '14px 16px',
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                      backgroundColor: (
                        error.type === 'network' ? '#C84B3120' :
                          error.type === 'auth' ? 'var(--amber-light)' :
                            error.type === 'image' ? '#6B4EFF18' :
                              'var(--danger-light)'
                      ),
                      border: `1px solid ${error.type === 'network' ? '#C84B3130' :
                          error.type === 'auth' ? 'var(--amber)44' :
                            error.type === 'image' ? '#6B4EFF30' :
                              'var(--danger)30'
                        }`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <AlertCircle size={18} color={
                        error.type === 'network' ? '#C84B31' :
                          error.type === 'auth' ? 'var(--amber)' :
                            error.type === 'image' ? '#6B4EFF' :
                              'var(--danger)'
                      } strokeWidth={2.2} />
                    </div>

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

              {/* Form Action Buttons: Add to Queue + Submit Scan */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleAddToQueue}
                  disabled={loading || batchQueue.length >= 5}
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    backgroundColor: batchQueue.length >= 5 ? 'var(--bg)' : 'var(--teal-light)',
                    color: batchQueue.length >= 5 ? 'var(--muted)' : 'var(--teal)',
                    border: `1px solid ${batchQueue.length >= 5 ? 'var(--border)' : 'var(--teal)'}`,
                    borderRadius: '12px',
                    padding: '13px 16px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: loading || batchQueue.length >= 5 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.18s ease',
                  }}
                  title={batchQueue.length >= 5 ? 'Max 5 products queue limit reached' : 'Add next product to batch'}
                >
                  <ListPlus size={18} />
                  {batchQueue.length >= 5 ? 'Queue Full (5/5)' : '+ Add Next Product'}
                </button>

                <button
                  id="analyze-btn"
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1.4,
                    minWidth: '200px',
                    backgroundColor: loading ? 'var(--muted)' : 'var(--navy)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px 16px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: loading ? 'none' : '0 4px 16px rgba(22,36,71,0.22)',
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
                      {batchQueue.length > 0
                        ? `Analyze All (${Math.min(5, batchQueue.length + (productName && images.length ? 1 : 0))})`
                        : 'Analyze Compliance'}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* ── BATCH QUEUE SECTION ── */}
            {batchQueue.length > 0 && (
              <div style={{
                marginTop: '24px',
                padding: '18px',
                backgroundColor: 'var(--bg)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800, color: 'var(--navy)' }}>
                    <Layers size={16} color="var(--teal)" />
                    Batch Queue ({batchQueue.length}/5 Products Ready)
                  </div>
                  <button
                    type="button"
                    onClick={clearQueue}
                    style={{
                      background: 'none', border: 'none', color: 'var(--danger)',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Clear Queue
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {batchQueue.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: '10px',
                        backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span style={{
                          width: '22px', height: '22px', borderRadius: '50%',
                          backgroundColor: 'var(--teal-light)', color: 'var(--teal)',
                          fontSize: '11px', fontWeight: 800, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {idx + 1}
                        </span>
                        <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.productName}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CameraIcon size={12} color="var(--teal)" />
                            {item.images.length} photo{item.images.length > 1 ? 's' : ''} attached
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {item.previews?.[0] && (
                          <img
                            src={item.previews[0]}
                            alt={`preview-${idx}`}
                            style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeFromQueue(item.id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
                            padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          title="Remove from queue"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            boxShadow: '0 8px 30px rgba(22,36,71,0.08)',
            animation: 'fadeIn 0.3s ease-in-out',
          }}
            className="p-5 sm:p-8"
          >
            {/* Multi-result batch selector tabs */}
            {batchResults.length > 1 && (
              <div style={{
                marginBottom: '20px', paddingBottom: '16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={15} color="var(--teal)" /> Batch Scanned ({batchResults.length} Items):
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {batchResults.map((r, index) => {
                    const rSt = statusStyle(r.status);
                    const isSelected = result._id === r._id;
                    return (
                      <button
                        key={r._id || index}
                        type="button"
                        onClick={() => {
                          setSelectedResultIndex(index);
                          setResult(r);
                        }}
                        style={{
                          padding: '6px 14px', borderRadius: '99px',
                          border: isSelected ? `2px solid ${rSt.border}` : '1px solid var(--border)',
                          backgroundColor: isSelected ? rSt.bg : 'var(--bg)',
                          color: isSelected ? rSt.text : 'var(--muted)',
                          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        <span>{r.productName || `Item ${index + 1}`}</span>
                        <span style={{
                          fontSize: '10px', padding: '1px 6px', borderRadius: '99px',
                          backgroundColor: rSt.border, color: '#FFFFFF', fontWeight: 800,
                        }}>
                          {rSt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-5"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h2 className="text-xl sm:text-2xl" style={{ fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                    {result.productName || 'Inspection Result'}
                  </h2>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    backgroundColor: st.bg, color: st.text,
                    padding: '5px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 800,
                    border: `1px solid ${st.border}44`, letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}>
                    {st.Icon && <st.Icon size={16} strokeWidth={2.5} />}
                    {st.label}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                  Inspection ID: <strong style={{ color: 'var(--ink)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{result._id}</strong>
                </p>
              </div>

              <button
                onClick={resetForm}
                className="w-full sm:w-auto justify-center"
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
                Scan More Products
              </button>
            </div>

            {/* Partial-failure warning (agar kuch images process nahi ho payi) */}
            {imageWarnings && imageWarnings.failedImages?.length > 0 && (
              <div style={{
                marginBottom: '20px', padding: '12px 16px',
                backgroundColor: 'var(--amber-light)', border: '1px solid var(--amber)44',
                borderRadius: '10px', fontSize: '12px', color: 'var(--ink)',
              }}>
                <strong>⚠️ Note:</strong> {imageWarnings.processedCount} out of {imageWarnings.totalCount} photos were analyzed successfully.
                <ul style={{ marginTop: '6px', marginBottom: 0, paddingLeft: '18px' }}>
                  {imageWarnings.failedImages.map((f, i) => (
                    <li key={i}>Photo {f.imageIndex}: {f.reason}</li>
                  ))}
                </ul>
              </div>
            )}

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