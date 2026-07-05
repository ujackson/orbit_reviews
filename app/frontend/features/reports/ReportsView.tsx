import { useState } from 'react';
import { Box, Typography, alpha, Button, Chip, LinearProgress, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Assessment as ReportIcon, PictureAsPdf, TableChart, Slideshow, Share, Schedule, CheckCircle, Add as AddIcon } from '@mui/icons-material';
import { color, text, radius } from '../../shared/tokens/design-tokens';
import { PageShell, SectionLabel, StatusBadge, AiCard } from '../../shared/enterprise';
import { toast } from 'sonner';

interface Report {
  id: string; label: string; period: string; status: 'ready' | 'generating' | 'scheduled';
  updated: string; pages: number; insights: number; highlights: string[];
  progress?: number;
}

const REPORTS: Report[] = [
  { id: 'weekly', label: 'Weekly Report', period: 'Jun 9–15, 2026', status: 'ready', updated: '1h ago', pages: 8, insights: 14, highlights: ['Rating up 0.3 points', '47 reviews need response', '3 critical alerts', 'Login issues trending'] },
  { id: 'monthly', label: 'Monthly Report', period: 'May 2026', status: 'ready', updated: '3d ago', pages: 24, insights: 38, highlights: ['Record review volume', 'Support CSAT improved 11%', 'Competitor gap closing', 'Texas checkout issue'] },
  { id: 'quarterly', label: 'Q2 2026 Report', period: 'Apr–Jun 2026', status: 'generating', updated: 'Generating…', pages: 0, insights: 0, highlights: [], progress: 67 },
  { id: 'board', label: 'Board Report', period: 'Q1 2026', status: 'ready', updated: '12d ago', pages: 16, insights: 22, highlights: ['Revenue impact analysis', 'NPS correlation data', 'Competitive positioning', 'Team performance'] },
];

const SCHEDULED = [
  { id: 's1', label: 'Weekly Digest — Every Monday 8:00 AM', recipients: 4, next: 'Jun 17, 8:00 AM' },
  { id: 's2', label: 'Monthly Board Report — 1st of month', recipients: 8, next: 'Jul 1, 9:00 AM' },
];

function ReportCard({ report }: { report: Report }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const isReady = report.status === 'ready';

  const handleExport = (type: string) => {
    if (!isReady) return;
    toast.success(`Exporting ${report.label} as ${type}…`);
  };

  return (
    <>
      <Box sx={{ bgcolor: '#fff', border: `1px solid ${alpha(color.neutral[900], 0.08)}`, borderRadius: radius.md, overflow: 'hidden' }}>
        <Box sx={{ px: '20px', py: '16px' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: report.highlights.length > 0 ? 1.5 : 0 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: radius.base, bgcolor: alpha(color.functional.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ReportIcon sx={{ fontSize: 20, color: color.functional.primary }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: text.primary }}>{report.label}</Typography>
                <StatusBadge label={report.status === 'ready' ? 'Ready' : report.status === 'generating' ? 'Generating' : 'Scheduled'} variant={report.status === 'ready' ? 'success' : report.status === 'generating' ? 'warning' : 'neutral'} size="xs" />
              </Box>
              <Typography sx={{ fontSize: 12, color: text.tertiary }}>{report.period}  ·  {report.updated}</Typography>
              {isReady && (
                <Box sx={{ display: 'flex', gap: 2, mt: 0.75 }}>
                  <Typography sx={{ fontSize: 11, color: text.secondary }}><strong style={{ color: text.primary }}>{report.pages}</strong> pages</Typography>
                  <Typography sx={{ fontSize: 11, color: text.secondary }}><strong style={{ color: text.primary }}>{report.insights}</strong> insights</Typography>
                </Box>
              )}
            </Box>
            {/* Export actions */}
            <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
              {[
                { icon: <PictureAsPdf sx={{ fontSize: 15 }} />, label: 'PDF', type: 'PDF' },
                { icon: <TableChart sx={{ fontSize: 15 }} />, label: 'CSV', type: 'CSV' },
                { icon: <Slideshow sx={{ fontSize: 15 }} />, label: 'PPT', type: 'PowerPoint' },
              ].map(e => (
                <Button key={e.type} size="small" variant="outlined" startIcon={e.icon} disabled={!isReady}
                  onClick={() => handleExport(e.type)}
                  sx={{ fontSize: 11, textTransform: 'none', borderColor: alpha(color.neutral[900], 0.13), color: text.secondary, px: 1, py: 0.375, minWidth: 0, gap: 0.25, '& .MuiButton-startIcon': { mr: '2px' } }}>
                  {e.label}
                </Button>
              ))}
              <Button size="small" variant="contained" startIcon={<Share sx={{ fontSize: 14 }} />} disabled={!isReady}
                onClick={() => setShareOpen(true)}
                sx={{ fontSize: 11, textTransform: 'none', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, px: 1.25, py: 0.375 }}>
                Share
              </Button>
            </Box>
          </Box>

          {/* Progress bar for generating */}
          {report.status === 'generating' && report.progress !== undefined && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '6px' }}>
                <Typography sx={{ fontSize: 11, color: text.secondary }}>Generating report…</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: text.primary }}>{report.progress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={report.progress}
                sx={{ height: 4, borderRadius: 2, bgcolor: alpha(color.neutral[900], 0.08), '& .MuiLinearProgress-bar': { bgcolor: color.functional.primary, borderRadius: 2 } }} />
            </Box>
          )}

          {/* Highlights */}
          {report.highlights.length > 0 && (
            <Box sx={{ pt: 1.5, borderTop: `1px solid ${alpha(color.neutral[900], 0.06)}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>Key highlights</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                {report.highlights.map(h => (
                  <Box key={h} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CheckCircle sx={{ fontSize: 12, color: color.functional.success, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12, color: text.secondary }}>{h}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Share dialog */}
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: radius.lg } }}>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Share {report.label}</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Typography sx={{ fontSize: 13, color: text.secondary, mb: 2 }}>Share a read-only link or send via email.</Typography>
          <Box sx={{ p: 1.5, bgcolor: alpha(color.neutral[900], 0.04), borderRadius: radius.base, border: `1px solid ${alpha(color.neutral[900], 0.08)}`, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: text.secondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              https://orbit.reviews/r/{report.id}/share/abc123
            </Typography>
            <Button size="small" onClick={() => { navigator.clipboard.writeText(`https://orbit.reviews/r/${report.id}/share/abc123`); toast.success('Link copied'); }}
              sx={{ fontSize: 10, textTransform: 'none', color: color.functional.primary, minWidth: 0, px: 1 }}>Copy</Button>
          </Box>
          <input
            placeholder="Send to email address…"
            value={shareEmail}
            onChange={e => setShareEmail(e.target.value)}
            style={{ width: '100%', fontSize: 13, padding: '8px 12px', borderRadius: 8, border: `1px solid ${alpha(color.neutral[900], 0.15)}`, outline: 'none', fontFamily: 'inherit' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setShareOpen(false)} sx={{ textTransform: 'none', color: text.secondary }}>Close</Button>
          <Button variant="contained" onClick={() => { toast.success(`Sent to ${shareEmail || 'clipboard'}`); setShareOpen(false); }}
            sx={{ textTransform: 'none', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, fontWeight: 600 }}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export const ReportsView = () => (
  <PageShell
    title="Reports"
    subtitle="Executive reporting auto-generated from review intelligence"
    actions={
      <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={() => toast.success('Custom report builder opening…')}
        sx={{ fontSize: 11, textTransform: 'none', color: text.secondary, borderColor: 'rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }, px: 1.5, height: 26 }}>
        Custom report
      </Button>
    }
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
      <SectionLabel label="Reports" />
      {REPORTS.map(r => <ReportCard key={r.id} report={r} />)}
    </Box>

    {/* Scheduled reports */}
    <Box>
      <SectionLabel label="Scheduled" />
      <Box sx={{ bgcolor: '#fff', border: `1px solid ${alpha(color.neutral[900], 0.08)}`, borderRadius: radius.md, overflow: 'hidden' }}>
        {SCHEDULED.map((s, i) => (
          <Box key={s.id}>
            {i > 0 && <Divider sx={{ opacity: 0.6 }} />}
            <Box sx={{ px: '20px', py: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Schedule sx={{ fontSize: 18, color: text.tertiary, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: text.primary }}>{s.label}</Typography>
                <Typography sx={{ fontSize: 11, color: text.tertiary }}>Next: {s.next}  ·  {s.recipients} recipients</Typography>
              </Box>
              <Button size="small" sx={{ fontSize: 11, textTransform: 'none', color: text.secondary }} onClick={() => toast.info('Schedule settings opening…')}>Edit</Button>
              <Button size="small" sx={{ fontSize: 11, textTransform: 'none', color: color.functional.error }} onClick={() => toast.success('Schedule paused')}>Pause</Button>
            </Box>
          </Box>
        ))}
        <Divider sx={{ opacity: 0.6 }} />
        <Box sx={{ px: '20px', py: '10px' }}>
          <Button size="small" onClick={() => toast.info('New schedule dialog opening…')}
            sx={{ fontSize: 11, textTransform: 'none', color: color.functional.primary }}>
            + Add scheduled report
          </Button>
        </Box>
      </Box>
    </Box>
  </PageShell>
);
