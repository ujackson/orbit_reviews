/**
 * Orbit Reviews — Shared Enterprise UI Patterns
 * The single source of truth for all reusable view-layer primitives.
 */
import { ReactNode } from 'react';
import { Box, Typography, Paper, Chip, Button, Divider, alpha } from '@mui/material';
import { TrendingUp, TrendingDown, Remove as FlatIcon } from '@mui/icons-material';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, Tooltip as RTooltip,
} from 'recharts';
import { color, text, radius } from './tokens/design-tokens';

// ─── Page shell ──────────────────────────────────────────────────────────────

interface PageShellProps {
  title: string;
  subtitle?: string;
  badge?: { label: string; color?: 'primary' | 'success' | 'warning' | 'error' };
  actions?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, badge, actions, tabs, children }: PageShellProps) {
  const badgeColors = {
    primary: { bg: alpha(color.functional.primary, 0.10), fg: color.functional.primary },
    success: { bg: alpha(color.functional.success, 0.10), fg: color.functional.success },
    warning: { bg: alpha(color.functional.warning, 0.10), fg: color.functional.warning },
    error: { bg: alpha(color.functional.error, 0.10), fg: color.functional.error },
  };
  const bc = badge ? badgeColors[badge.color || 'primary'] : null;

  return (
    <Box sx={{
      flex: 1, height: '100vh', overflow: 'auto',
      bgcolor: '#FAFAFA',
      '&::-webkit-scrollbar': { width: 5 },
      '&::-webkit-scrollbar-thumb': { bgcolor: alpha(color.neutral[900], 0.12), borderRadius: 3 },
    }}>
      {/* Sticky header */}
      <Box sx={{
        px: '32px', pt: '18px', pb: tabs ? 0 : '16px',
        bgcolor: '#fff',
        borderBottom: `1px solid ${alpha(color.neutral[900], 0.08)}`,
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: tabs ? 1.5 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: text.primary, letterSpacing: '-0.01em' }}>
                  {title}
                </Typography>
                {badge && bc && (
                  <Chip size="small" label={badge.label}
                    sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: bc.bg, color: bc.fg, '& .MuiChip-label': { px: '6px' } }} />
                )}
              </Box>
              {subtitle && (
                <Typography sx={{ fontSize: 11, color: text.tertiary, mt: '1px' }}>{subtitle}</Typography>
              )}
            </Box>
          </Box>
          {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{actions}</Box>}
        </Box>
        {tabs}
      </Box>

      {/* Content */}
      <Box sx={{ px: '32px', py: '24px' }}>
        {children}
      </Box>
    </Box>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

export function SectionLabel({ label, action, onAction }: { label: string; action?: string; onAction?: () => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </Typography>
      {action && onAction && (
        <Typography onClick={onAction}
          sx={{ fontSize: 11, color: color.functional.primary, fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
          {action}
        </Typography>
      )}
    </Box>
  );
}

// ─── Stat card with optional sparkline ───────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaDir?: 'up' | 'down' | 'flat';
  sub?: string;
  sparkData?: { v: number }[];
  sparkColor?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, delta, deltaDir = 'up', sub, sparkData, sparkColor, onClick }: StatCardProps) {
  const positive = deltaDir === 'up';
  const flat = deltaDir === 'flat';
  const deltaColor = flat ? text.tertiary : positive ? color.functional.success : color.functional.error;
  const DeltaIcon = flat ? FlatIcon : positive ? TrendingUp : TrendingDown;

  return (
    <Paper elevation={0} onClick={onClick}
      sx={{
        flex: 1, minWidth: 140, p: '13px 14px',
        border: '1px solid #E5E7EB',
        borderRadius: '10px', bgcolor: '#fff',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.14s ease',
        '&:hover': onClick ? {
          borderColor: 'rgba(0,0,0,0.15)',
          boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
          transform: 'translateY(-1px)',
        } : {},
      }}>
      <Typography sx={{ fontSize: 10, fontWeight: 600, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 600, color: text.primary, lineHeight: 1, letterSpacing: '-0.02em', mb: 0.75 }}>
            {value}
          </Typography>
          {delta && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DeltaIcon sx={{ fontSize: 12, color: deltaColor }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: deltaColor }}>{delta}</Typography>
              {sub && <Typography sx={{ fontSize: 11, color: text.tertiary }}>{sub}</Typography>}
            </Box>
          )}
          {!delta && sub && <Typography sx={{ fontSize: 11, color: text.tertiary }}>{sub}</Typography>}
        </Box>
        {sparkData && (
          <Box sx={{ width: 64, height: 36, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                <defs>
                  <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sparkColor || color.functional.primary} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={sparkColor || color.functional.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={sparkColor || color.functional.primary} strokeWidth={1.5} fill={`url(#sg-${label})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

// ─── Enterprise table shell ───────────────────────────────────────────────────

interface ColDef {
  label: string;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps {
  columns: ColDef[];
  children: ReactNode;
  emptyState?: ReactNode;
}

export function DataTable({ columns, children, emptyState }: DataTableProps) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: radius.md, bgcolor: '#fff', overflow: 'hidden' }}>
      {/* Column headers */}
      <Box sx={{
        display: 'flex', alignItems: 'center',
        px: '16px', py: '9px',
        bgcolor: alpha(color.neutral[900], 0.025),
        borderBottom: `1px solid ${alpha(color.neutral[900], 0.07)}`,
      }}>
        {columns.map(col => (
          <Typography key={col.label}
            sx={{
              fontSize: 10, fontWeight: 600, color: text.tertiary,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              width: col.width, flex: col.width ? undefined : 1,
              textAlign: col.align || 'left',
            }}>
            {col.label}
          </Typography>
        ))}
      </Box>
      {children || emptyState}
    </Paper>
  );
}

export function DataRow({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <>
      <Box onClick={onClick}
        sx={{
          display: 'flex', alignItems: 'center',
          px: '16px', py: '11px',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'background 0.08s',
          '&:hover': { bgcolor: onClick ? alpha(color.neutral[900], 0.025) : undefined },
        }}>
        {children}
      </Box>
      <Divider sx={{ opacity: 0.6 }} />
    </>
  );
}

// ─── Card surface ─────────────────────────────────────────────────────────────

export function Card({ children, accent, onClick, padding = '18px 20px' }: {
  children: ReactNode; accent?: string; onClick?: () => void; padding?: string;
}) {
  return (
    <Paper elevation={0} onClick={onClick}
      sx={{
        p: padding,
        border: '1px solid #E5E7EB',
        borderLeft: accent ? `3px solid ${accent}` : '1px solid #E5E7EB',
        borderRadius: '10px', bgcolor: '#fff',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.14s ease',
        '&:hover': onClick ? { boxShadow: '0 3px 12px rgba(0,0,0,0.07)', transform: 'translateY(-1px)' } : {},
      }}>
      {children}
    </Paper>
  );
}

// ─── AI surface card ──────────────────────────────────────────────────────────

export function AiCard({ children, padding = '16px 20px' }: { children: ReactNode; padding?: string }) {
  return (
    <Paper elevation={0}
      sx={{
        p: padding,
        border: `1px solid ${alpha(color.ai[400], 0.22)}`,
        borderLeft: `3px solid ${color.ai[500]}`,
        borderRadius: radius.md,
        bgcolor: alpha(color.ai[50], 0.6),
      }}>
      {children}
    </Paper>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'ai';

const statusMap: Record<StatusVariant, { bg: string; fg: string }> = {
  success: { bg: alpha(color.functional.success, 0.10), fg: color.functional.success },
  warning: { bg: alpha(color.functional.warning, 0.12), fg: color.functional.warning },
  error: { bg: alpha(color.functional.error, 0.10), fg: color.functional.error },
  info: { bg: alpha(color.functional.info, 0.10), fg: color.functional.info },
  neutral: { bg: alpha(color.neutral[900], 0.07), fg: text.secondary },
  ai: { bg: alpha(color.ai[400], 0.14), fg: color.ai[700] },
};

export function StatusBadge({ label, variant = 'neutral', size = 'sm' }: { label: string; variant?: StatusVariant; size?: 'xs' | 'sm' | 'md' }) {
  const s = statusMap[variant];
  const heights = { xs: 16, sm: 18, md: 22 };
  const fontSizes = { xs: 9, sm: 10, md: 12 };
  return (
    <Chip size="small" label={label}
      sx={{
        height: heights[size], fontSize: fontSizes[size], fontWeight: 600,
        bgcolor: s.bg, color: s.fg,
        '& .MuiChip-label': { px: size === 'md' ? '8px' : '6px' },
      }} />
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, body, action, onAction }: {
  icon?: ReactNode; title: string; body?: string; action?: string; onAction?: () => void;
}) {
  return (
    <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      {icon && <Box sx={{ color: text.tertiary, mb: 0.5 }}>{icon}</Box>}
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: text.secondary }}>{title}</Typography>
      {body && <Typography sx={{ fontSize: 13, color: text.tertiary, textAlign: 'center', maxWidth: 320 }}>{body}</Typography>}
      {action && onAction && (
        <Button size="small" variant="contained" onClick={onAction}
          sx={{ mt: 1, textTransform: 'none', fontSize: 12, bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover } }}>
          {action}
        </Button>
      )}
    </Box>
  );
}

// ─── Dot indicator ────────────────────────────────────────────────────────────

export function Dot({ color: c, size = 8 }: { color: string; size?: number }) {
  return <Box sx={{ width: size, height: size, borderRadius: '50%', bgcolor: c, flexShrink: 0 }} />;
}

// ─── Monospace chip ───────────────────────────────────────────────────────────

export function MonoChip({ label }: { label: string }) {
  return (
    <Chip size="small" label={label}
      sx={{ height: 18, fontSize: 10, fontFamily: 'monospace', bgcolor: alpha(color.neutral[900], 0.05), color: text.secondary, '& .MuiChip-label': { px: '6px' } }} />
  );
}
