import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

const styles = {
  success: { Icon: CheckCircle2, color: '#15803d', background: '#f0fdf4', border: '#86efac' },
  error: { Icon: XCircle, color: '#b91c1c', background: '#fef2f2', border: '#fca5a5' },
  info: { Icon: Info, color: '#1d4ed8', background: '#eff6ff', border: '#93c5fd' },
};

function Toast({ toasts = [], onDismiss }) {
  return (
    <div aria-live="polite" style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 1000, display: 'grid', gap: '10px', maxWidth: '360px' }}>
      {toasts.map((toast) => {
        const { Icon, color, background, border } = styles[toast.type] || styles.info;
        return (
          <div key={toast.id} role="status" style={{ display: 'flex', gap: '10px', padding: '14px', border: `1px solid ${border}`, borderRadius: '10px', backgroundColor: background, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.16)' }}>
            <Icon size={20} color={color} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, color: '#0f172a' }}>
              {toast.title && <strong style={{ display: 'block', fontSize: '14px' }}>{toast.title}</strong>}
              {toast.message && <span style={{ display: 'block', marginTop: '2px', fontSize: '13px' }}>{toast.message}</span>}
            </div>
            <button type="button" onClick={() => onDismiss?.(toast.id)} aria-label="Dismiss notification" style={{ alignSelf: 'flex-start', border: 0, background: 'transparent', color: '#475569', cursor: 'pointer', padding: 0 }}><X size={17} /></button>
          </div>
        );
      })}
    </div>
  );
}

export default Toast;
