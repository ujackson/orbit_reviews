import { Box, Typography, alpha, Button, Chip, Divider } from '@mui/material';
import {
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  CheckCircle as VerifiedIcon,
  ErrorOutline as RiskIcon,
  OpenInNew as OpenIcon,
  Groups as TeamIcon,
} from '@mui/icons-material';
import { color, text } from '../../shared/tokens/design-tokens';
import { MOCK_ISSUES, MOCK_ACTIONS, severityConfig, statusConfig } from '../../shared/mock/issues';
import { useNavigate, useWorkspacePath } from '@/hooks/useInertiaNavigation';
import { toast } from 'sonner';

// ─── Mock digest data ─────────────────────────────────────────────────────────

const TODAY = 'Tuesday, June 16, 2026';

const POSITIVE_SIGNAL = {
  title: 'Billing complaint volume declined 31%',
  detail: 'Following the renewal email rewrite, billing-related tickets dropped from 52 to 36 per week.',
  closeable: true,
  issueId: 'i5',
};

const BLOCKING_TEAM = {
  team: 'Mobile Platform',
  issue: 'Android authentication failures after v5.1.0',
  blockedDays: 6,
  reason: 'SDK rollback action is overdue — no update from owner',
};

const CLOSEABLE_ISSUE = {
  title: 'Shipping damage reports after carrier transition',
  reason: 'Complaint volume declined 18% over 30 days. Monitoring period complete.',
  issueId: 'i3',
};

const EXEC_FOCUS = MOCK_ISSUES[0]; // Android auth — highest risk

// ─── Section label ────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <Typography sx={{ fontSize: 10, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.08em', mb: '10px' }}>
      {label}
    </Typography>
  );
}

// ─── Executive Brief View ─────────────────────────────────────────────────────

export const ExecutiveBriefView = () => {
  const navigate = useNavigate();
  const workspacePath = useWorkspacePath();

  const criticalCount = MOCK_ISSUES.filter(i => i.severity === 'critical').length;
  const overdueActions = MOCK_ACTIONS.filter(a => a.status === 'overdue').length;
  const totalRisk = MOCK_ISSUES.reduce((s, i) => s + i.riskAmount, 0);
  const topIssue = MOCK_ISSUES[0];

  return (
    <Box sx={{ flex: 1, height: '100%', overflow: 'auto', bgcolor: '#fff', '&::-webkit-scrollbar': { width: 5 } }}>

      {/* Header */}
      <Box sx={{ px: '32px', pt: '28px', pb: '20px', borderBottom: '1px solid #E7E9EE' }}>
        <Typography sx={{ fontSize: 11, color: text.tertiary, mb: '4px' }}>{TODAY}</Typography>
        <Typography sx={{ fontSize: 24, fontWeight: 600, color: text.primary, letterSpacing: '-0.025em', lineHeight: 1.2, mb: '8px' }}>
          Good morning.
        </Typography>
        <Typography sx={{ fontSize: 14, color: text.secondary, lineHeight: 1.7 }}>
          {criticalCount} customer issue{criticalCount !== 1 ? 's' : ''} need{criticalCount === 1 ? 's' : ''} your attention today.
          Revenue at risk:{' '}
          <Box component="span" sx={{ fontWeight: 700, color: color.functional.error }}>
            ${(totalRisk / 1000).toFixed(0)}K est.
          </Box>
          {' '}The {BLOCKING_TEAM.team} team is blocking the highest-value issue.
          One issue is ready to close.
        </Typography>
      </Box>

      <Box sx={{ px: '32px', py: '24px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: 800 }}>

        {/* Recommended executive focus */}
        <Box>
          <SectionHeader label="Recommended executive focus today" />
          {/* §11 spec: neutral 1px border, 3px critical-red left rail */}
          <Box sx={{
            border: '1px solid #E7E9EE',
            borderLeft: `3px solid ${color.functional.error}`,
            borderRadius: '8px', overflow: 'hidden', bgcolor: '#fff',
          }}>
            <Box sx={{ px: '18px', py: '10px', bgcolor: '#FAFAFA', borderBottom: '1px solid #E7E9EE', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RiskIcon sx={{ fontSize: 14, color: color.functional.error }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: color.functional.error, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Critical · {EXEC_FOCUS.ageLabel} open · Unresolved
              </Typography>
            </Box>
            <Box sx={{ px: '18px', py: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: text.primary, letterSpacing: '-0.01em', mb: '8px', lineHeight: 1.3 }}>
                  {EXEC_FOCUS.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: '20px', mb: '10px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Est. risk',  value: `$${(EXEC_FOCUS.riskAmount / 1000).toFixed(0)}K ARR`, color: color.functional.error },
                    { label: 'Evidence',   value: `${EXEC_FOCUS.evidenceReviews} reviews · ${EXEC_FOCUS.evidenceTickets} tickets`, color: text.primary },
                    { label: 'Affected',   value: `~${EXEC_FOCUS.evidenceUsers.toLocaleString()} users`, color: text.secondary },
                    { label: 'Trend',      value: `${EXEC_FOCUS.trend} in ${EXEC_FOCUS.trendWindow}`, color: color.functional.error },
                  ].map(kf => (
                    <Box key={kf.label}>
                      <Typography sx={{ fontSize: 10, color: text.tertiary, mb: '1px' }}>{kf.label}</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: kf.color }}>{kf.value}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ p: '10px 12px', bgcolor: alpha(color.functional.primary, 0.04), border: `1px solid ${alpha(color.functional.primary, 0.15)}`, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: text.primary, flex: 1 }}>
                    Recommended: {EXEC_FOCUS.nextAction}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="small"
                endIcon={<OpenIcon sx={{ fontSize: 13 }} />}
                onClick={() => navigate(workspacePath('insights'))}
                sx={{ fontSize: 12, height: 32, bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, textTransform: 'none', fontWeight: 700, flexShrink: 0 }}
              >
                Open issue
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Issues needing attention */}
        <Box>
          <SectionHeader label={`${MOCK_ISSUES.filter(i => !['closed', 'verified', 'dismissed'].includes(i.status)).length} issues need attention`} />
          <Box sx={{ border: '1px solid #E7E9EE', borderRadius: '8px', overflow: 'hidden' }}>
            {MOCK_ISSUES.map((issue, i) => {
              const sv = severityConfig[issue.severity];
              const st = statusConfig[issue.status];
              const bad = issue.trendDir === 'up' && ['critical', 'high'].includes(issue.severity);
              return (
                <Box key={issue.id}>
                  {i > 0 && <Divider sx={{ borderColor: '#F3F4F6' }} />}
                  <Box
                    onClick={() => navigate(workspacePath('insights'))}
                    sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '16px', py: '10px', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' } }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: sv.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 13, color: text.primary, fontWeight: 500, flex: 1 }} noWrap>{issue.title}</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: color.functional.error, flexShrink: 0 }}>${(issue.riskAmount / 1000).toFixed(0)}K</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                      {issue.trendDir === 'up'
                        ? <UpIcon sx={{ fontSize: 11, color: bad ? color.functional.error : color.functional.success }} />
                        : <DownIcon sx={{ fontSize: 11, color: color.functional.success }} />}
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: bad ? color.functional.error : color.functional.success }}>{issue.trend}</Typography>
                    </Box>
                    <Chip size="small" label={st.label}
                      sx={{ height: 16, fontSize: 9, fontWeight: 600, bgcolor: st.bg, color: st.color, borderRadius: '3px', '& .MuiChip-label': { px: '4px' } }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Blocking team */}
          <Box>
            <SectionHeader label="Team blocking highest-value issue" />
            <Box sx={{ p: '14px 16px', border: `1px solid ${alpha(color.functional.warning, 0.3)}`, borderRadius: '8px', bgcolor: alpha(color.functional.warning, 0.03) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '8px' }}>
                <TeamIcon sx={{ fontSize: 16, color: color.functional.warning }} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary }}>{BLOCKING_TEAM.team}</Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: text.secondary, mb: '6px', lineHeight: 1.5 }}>
                {BLOCKING_TEAM.issue}
              </Typography>
              <Typography sx={{ fontSize: 11, color: color.functional.warning, fontWeight: 600 }}>
                {BLOCKING_TEAM.reason}
              </Typography>
              <Button size="small"
                onClick={() => navigate(workspacePath('alerts'))}
                sx={{ mt: '10px', fontSize: 11, color: color.functional.primary, border: `1px solid ${alpha(color.functional.primary, 0.3)}`, px: '10px', height: 26, textTransform: 'none' }}>
                View overdue actions
              </Button>
            </Box>
          </Box>

          {/* Positive signal */}
          <Box>
            <SectionHeader label="Positive signal" />
            <Box sx={{ p: '14px 16px', border: `1px solid ${alpha(color.functional.success, 0.3)}`, borderRadius: '8px', bgcolor: alpha(color.functional.success, 0.03) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '8px' }}>
                <DownIcon sx={{ fontSize: 16, color: color.functional.success }} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary }}>{POSITIVE_SIGNAL.title}</Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: text.secondary, lineHeight: 1.5 }}>{POSITIVE_SIGNAL.detail}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Ready to close */}
        <Box>
          <SectionHeader label="One issue is ready to close" />
          <Box sx={{ p: '14px 16px', border: `1px solid ${alpha(color.functional.success, 0.3)}`, borderRadius: '8px', bgcolor: alpha(color.functional.success, 0.03), display: 'flex', alignItems: 'center', gap: '14px' }}>
            <VerifiedIcon sx={{ fontSize: 20, color: color.functional.success, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: text.primary, mb: '2px' }}>{CLOSEABLE_ISSUE.title}</Typography>
              <Typography sx={{ fontSize: 12, color: text.secondary }}>{CLOSEABLE_ISSUE.reason}</Typography>
            </Box>
            <Button size="small" variant="contained"
              onClick={() => toast.success('Issue closed')}
              sx={{ fontSize: 11, height: 28, bgcolor: color.functional.success, '&:hover': { bgcolor: '#047857' }, textTransform: 'none', fontWeight: 600, flexShrink: 0 }}>
              Close issue
            </Button>
            <Button size="small"
              onClick={() => navigate(workspacePath('insights'))}
              sx={{ fontSize: 11, height: 28, color: text.secondary, border: '1px solid #E7E9EE', textTransform: 'none', flexShrink: 0 }}>
              Review
            </Button>
          </Box>
        </Box>

        {/* Overdue actions */}
        <Box>
          <SectionHeader label={`${overdueActions} action${overdueActions !== 1 ? 's' : ''} overdue`} />
          <Box sx={{ border: '1px solid #E7E9EE', borderRadius: '8px', overflow: 'hidden' }}>
            {MOCK_ACTIONS.filter(a => a.status === 'overdue').map((action, i, arr) => (
              <Box key={action.id}>
                {i > 0 && <Divider sx={{ borderColor: '#F3F4F6' }} />}
                <Box onClick={() => navigate(workspacePath('alerts'))}
                  sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: '16px', py: '10px', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.015)' } }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color.functional.error, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 13, color: text.primary, fontWeight: 500, flex: 1 }} noWrap>{action.title}</Typography>
                  <Typography sx={{ fontSize: 11, color: text.secondary }}>{action.owner}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: color.functional.error }}>Due {action.due}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

      </Box>
    </Box>
  );
};
