import { Lock, Globe, Eye, EyeOff } from 'lucide-react';

interface DataField {
  label: string;
  value: string;
  isPrivate: boolean;
}

interface PreSubmissionPanelProps {
  title?: string;
  fields: DataField[];
  className?: string;
}

export function PreSubmissionPanel({
  title = 'What Will Be Submitted',
  fields,
  className = '',
}: PreSubmissionPanelProps) {
  const privateFields = fields.filter((f) => f.isPrivate);
  const publicFields = fields.filter((f) => !f.isPrivate);

  return (
    <div
      className={`rounded-xl border-2 border-dashed overflow-hidden ${className}`}
      style={{ borderColor: 'var(--privacy-border)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ background: 'var(--privacy-tint)' }}
      >
        <Eye className="h-4 w-4" style={{ color: 'var(--primary)' }} />
        <h4 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h4>
      </div>

      {/* Fields */}
      <div className="divide-y divide-border">
        {/* On-chain fields */}
        {publicFields.map((field, i) => (
          <div key={`public-${i}`} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--zk-accent)' }} />
              <span className="text-sm text-muted-foreground">{field.label}</span>
              <span
                className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded"
                style={{
                  background: 'var(--zk-accent-tint)',
                  color: 'var(--zk-accent)',
                }}
              >
                on-chain
              </span>
            </div>
            <span className="text-sm font-medium font-mono">{field.value}</span>
          </div>
        ))}

        {/* Private fields */}
        {privateFields.map((field, i) => (
          <div
            key={`private-${i}`}
            className="flex items-center justify-between px-4 py-3"
            style={{ background: 'var(--privacy-tint)' }}
          >
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <span className="text-sm text-muted-foreground">{field.label}</span>
              <span
                className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded"
                style={{
                  background: 'var(--privacy-tint)',
                  color: 'var(--primary)',
                  border: '1px solid var(--privacy-border)',
                }}
              >
                local only
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <EyeOff className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                🔒 Private
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
