import { CheckCircle2, XCircle, ImageIcon } from 'lucide-react';

function EvidencePanel({ extractedData, violations, imageUrl }) {
  const violatedFields = violations.map((v) => v.field);
  const fields = Object.keys(extractedData).filter((key) => key !== 'confidence');

  return (
    <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
      {/* Left — product image */}
      {imageUrl && (
        <div className="w-full sm:w-[220px] shrink-0">
          <p style={{
            fontSize: '12px', fontWeight: 600, color: 'var(--muted)',
            textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <ImageIcon size={12} strokeWidth={2} />
            Product Image
          </p>
          <div className="w-full flex justify-center bg-[var(--bg)] rounded-xl p-2 border border-[var(--border)]">
            <img
              src={imageUrl}
              alt="product"
              style={{
                borderRadius: '8px',
                maxHeight: '260px',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}

      {/* Right — field-by-field breakdown */}
      <div className="w-full flex-1 min-w-0">
        <p style={{
          fontSize: '12px', fontWeight: 600, color: 'var(--muted)',
          textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px',
        }}>
          Evidence — Field by Field
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {fields.map((field) => {
            const isMissing  = violatedFields.includes(field);
            const value      = extractedData[field];
            const confidence = extractedData.confidence?.[field];

            return (
              <div
                key={field}
                className="flex items-center justify-between p-3 sm:p-[12px_14px] rounded-lg gap-3"
                style={{
                  backgroundColor: isMissing ? 'var(--danger-light)' : 'var(--teal-light)',
                  borderLeft: `4px solid ${isMissing ? 'var(--danger)' : 'var(--teal)'}`,
                  border: `1px solid ${isMissing ? 'var(--danger)' : 'var(--border)'}`,
                  borderLeftWidth: '4px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '2px' }}>
                    {formatFieldName(field)}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: value ? 'var(--ink)' : 'var(--muted)',
                    fontStyle: value ? 'normal' : 'italic',
                    wordBreak: 'break-word',
                  }}>
                    {value || 'Not detected on package'}
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginLeft: '8px', flexShrink: 0 }}>
                  {isMissing
                    ? <XCircle size={20} color="var(--danger)" strokeWidth={2} />
                    : <CheckCircle2 size={20} color="var(--teal)" strokeWidth={2} />
                  }
                  {confidence !== undefined && (
                    <div style={{
                      fontSize: '11px',
                      color: confidence >= 0.7 ? 'var(--teal)' : confidence >= 0.4 ? 'var(--amber)' : 'var(--danger)',
                      fontWeight: 600,
                      marginTop: '4px',
                      whiteSpace: 'nowrap',
                    }}>
                      {Math.round(confidence * 100)}% conf.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatFieldName(field) {
  const result = field.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export default EvidencePanel;