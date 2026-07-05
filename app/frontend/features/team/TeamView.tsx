import { useState } from 'react';
import { Box, Typography, alpha, Button, Chip, Divider, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, LinearProgress } from '@mui/material';
import { Add as AddIcon, MoreVert as MoreIcon, Mail as MailIcon } from '@mui/icons-material';
import { color, text, radius } from '../../shared/tokens/design-tokens';
import { PageShell, SectionLabel, StatusBadge, DataTable, DataRow, StatCard } from '../../shared/enterprise';
import { toast } from 'sonner';

type Role = 'Admin' | 'Manager' | 'Agent' | 'Viewer';

interface Member {
  id: string; name: string; email: string; role: Role;
  status: 'active' | 'inactive' | 'pending';
  reviews: number; responseRate: number; avgResponseTime: string;
  joinedDate: string; lastActive: string;
}

const MEMBERS: Member[] = [
  { id: 'm1', name: 'Sarah Chen', email: 'sarah@acme.com', role: 'Admin', status: 'active', reviews: 312, responseRate: 91, avgResponseTime: '1.8h', joinedDate: 'Jan 2024', lastActive: '5 min ago' },
  { id: 'm2', name: 'Marcus Thompson', email: 'marcus@acme.com', role: 'Manager', status: 'active', reviews: 248, responseRate: 87, avgResponseTime: '2.4h', joinedDate: 'Mar 2024', lastActive: '1h ago' },
  { id: 'm3', name: 'Priya Sharma', email: 'priya@acme.com', role: 'Agent', status: 'active', reviews: 194, responseRate: 82, avgResponseTime: '3.1h', joinedDate: 'Jun 2024', lastActive: '2h ago' },
  { id: 'm4', name: 'David Rodriguez', email: 'david@acme.com', role: 'Agent', status: 'active', reviews: 167, responseRate: 79, avgResponseTime: '3.4h', joinedDate: 'Jun 2024', lastActive: '4h ago' },
  { id: 'm5', name: 'Jennifer Kim', email: 'jennifer@acme.com', role: 'Agent', status: 'inactive', reviews: 43, responseRate: 61, avgResponseTime: '6.2h', joinedDate: 'Sep 2024', lastActive: '3d ago' },
  { id: 'm6', name: 'Alex Rivera', email: 'alex@acme.com', role: 'Viewer', status: 'pending', reviews: 0, responseRate: 0, avgResponseTime: '—', joinedDate: 'Invited', lastActive: 'Never' },
];

const roleConfig: Record<Role, { variant: 'error' | 'warning' | 'neutral' | 'info' }> = {
  Admin: { variant: 'error' },
  Manager: { variant: 'warning' },
  Agent: { variant: 'neutral' },
  Viewer: { variant: 'info' },
};

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Agent');

  const handleSubmit = () => {
    if (!email.trim()) { toast.error('Email required'); return; }
    toast.success(`Invitation sent to ${email}`);
    setEmail(''); setRole('Agent'); onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: radius.lg } }}>
      <DialogTitle sx={{ fontSize: 14, fontWeight: 700 }}>Invite team member</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField label="Email address" placeholder="colleague@company.com" value={email} onChange={e => setEmail(e.target.value)} fullWidth size="small" type="email" />
        <FormControl size="small" fullWidth>
          <InputLabel>Role</InputLabel>
          <Select value={role} label="Role" onChange={e => setRole(e.target.value as Role)}>
            {(['Admin', 'Manager', 'Agent', 'Viewer'] as Role[]).map(r => (
              <MenuItem key={r} value={r}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{r}</Typography>
                  <Typography sx={{ fontSize: 11, color: text.tertiary }}>
                    {r === 'Admin' ? '— Full access' : r === 'Manager' ? '— Manage team & reviews' : r === 'Agent' ? '— Respond to reviews' : '— Read-only'}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ px: '12px', py: '10px', bgcolor: alpha(color.neutral[900], 0.04), borderRadius: radius.base, border: `1px solid ${alpha(color.neutral[900], 0.07)}` }}>
          <Typography sx={{ fontSize: 11, color: text.secondary, lineHeight: 1.6 }}>
            An email invitation will be sent. The link expires in 7 days. You can change their role at any time.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: text.secondary }}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}
          sx={{ textTransform: 'none', bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, fontWeight: 600 }}>
          Send invitation
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function MemberRow({ member }: { member: Member }) {
  const rc = roleConfig[member.role];
  const statusVariant = member.status === 'active' ? 'success' : member.status === 'pending' ? 'warning' : 'neutral';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', px: '16px', py: '11px', gap: 2, '&:hover': { bgcolor: alpha(color.neutral[900], 0.02) } }}>
      {/* Avatar + name */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1.8, minWidth: 0 }}>
        <Avatar sx={{ width: 30, height: 30, fontSize: 11, fontWeight: 700, bgcolor: alpha(color.functional.primary, 0.12), color: color.functional.primary }}>
          {member.name.split(' ').map(n => n[0]).join('')}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: text.primary, lineHeight: 1.2 }}>{member.name}</Typography>
          <Typography sx={{ fontSize: 11, color: text.tertiary }}>{member.email}</Typography>
        </Box>
      </Box>

      {/* Role */}
      <Box sx={{ flex: 0.8, display: 'flex', justifyContent: 'flex-start' }}>
        <StatusBadge label={member.role} variant={rc.variant} size="xs" />
      </Box>

      {/* Reviews handled */}
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: text.primary, flex: 1, textAlign: 'right' }}>
        {member.reviews > 0 ? member.reviews.toLocaleString() : '—'}
      </Typography>

      {/* Response rate */}
      <Box sx={{ flex: 1, pr: 1 }}>
        {member.responseRate > 0 ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '4px' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: member.responseRate >= 80 ? color.functional.success : member.responseRate >= 60 ? color.functional.warning : color.functional.error }}>
                {member.responseRate}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={member.responseRate}
              sx={{ height: 3, borderRadius: 2, bgcolor: alpha(color.neutral[900], 0.08), '& .MuiLinearProgress-bar': { bgcolor: member.responseRate >= 80 ? color.functional.success : member.responseRate >= 60 ? color.functional.warning : color.functional.error, borderRadius: 2 } }} />
          </>
        ) : (
          <Typography sx={{ fontSize: 11, color: text.tertiary, textAlign: 'right' }}>—</Typography>
        )}
      </Box>

      {/* Avg response time */}
      <Typography sx={{ fontSize: 12, color: text.secondary, flex: 0.8, textAlign: 'right' }}>{member.avgResponseTime}</Typography>

      {/* Last active */}
      <Typography sx={{ fontSize: 11, color: text.tertiary, flex: 0.8, textAlign: 'right' }}>{member.lastActive}</Typography>

      {/* Status + actions */}
      <Box sx={{ flex: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
        <StatusBadge label={member.status === 'active' ? 'Active' : member.status === 'pending' ? 'Pending' : 'Inactive'} variant={statusVariant} size="xs" />
        <Button size="small" onClick={() => toast.success(`Email sent to ${member.name}`)}
          sx={{ fontSize: 10, textTransform: 'none', color: text.tertiary, minWidth: 0, px: 0.75, '&:hover': { color: color.functional.primary } }}>
          <MailIcon sx={{ fontSize: 14 }} />
        </Button>
      </Box>
    </Box>
  );
}

export const TeamView = () => {
  const [inviteOpen, setInviteOpen] = useState(false);
  const active = MEMBERS.filter(m => m.status === 'active');
  const totalReviews = MEMBERS.reduce((s, m) => s + m.reviews, 0);
  const avgRate = Math.round(active.reduce((s, m) => s + m.responseRate, 0) / active.length);

  return (
    <PageShell
      title="Team"
      subtitle={`${active.length} active members  ·  ${MEMBERS.filter(m => m.status === 'pending').length} pending invitation`}
      actions={
        <Button size="small" variant="contained" startIcon={<AddIcon sx={{ fontSize: 15 }} />} onClick={() => setInviteOpen(true)}
          sx={{ fontSize: 11, textTransform: 'none', fontWeight: 600, bgcolor: color.functional.primary, '&:hover': { bgcolor: color.functional.primaryHover }, height: 26, px: 1.5 }}>
          Invite member
        </Button>
      }
    >
      {/* Team KPIs */}
      <Box sx={{ display: 'flex', gap: 1.25, mb: 3 }}>
        <StatCard label="Active Members" value={`${active.length}`} sub={`of ${MEMBERS.length} total`} />
        <StatCard label="Reviews Handled" value={totalReviews.toLocaleString()} delta="+18%" deltaDir="up" sub="this month" />
        <StatCard label="Avg Response Rate" value={`${avgRate}%`} delta="+7pp" deltaDir="up" sub="vs last month" />
        <StatCard label="Avg Response Time" value="2.8h" delta="-0.4h" deltaDir="up" sub="faster" />
      </Box>

      {/* Member table */}
      <Box sx={{ bgcolor: '#fff', border: `1px solid ${alpha(color.neutral[900], 0.08)}`, borderRadius: radius.md, overflow: 'hidden' }}>
        {/* Column headers */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: '16px', py: '8px', gap: 2, bgcolor: alpha(color.neutral[900], 0.025), borderBottom: `1px solid ${alpha(color.neutral[900], 0.07)}` }}>
          {[
            { label: 'Member', flex: 1.8 }, { label: 'Role', flex: 0.8 },
            { label: 'Reviews', flex: 1, right: true }, { label: 'Response Rate', flex: 1, right: true },
            { label: 'Avg Time', flex: 0.8, right: true }, { label: 'Last Active', flex: 0.8, right: true },
            { label: '', flex: 0.6 },
          ].map((col, i) => (
            <Typography key={i} sx={{ fontSize: 9, fontWeight: 700, color: text.tertiary, textTransform: 'uppercase', letterSpacing: '0.07em', flex: col.flex, textAlign: (col as any).right ? 'right' : 'left' }}>
              {col.label}
            </Typography>
          ))}
        </Box>
        {MEMBERS.map((m, i) => (
          <Box key={m.id}>
            {i > 0 && <Divider sx={{ opacity: 0.5 }} />}
            <MemberRow member={m} />
          </Box>
        ))}
      </Box>

      {/* RBAC reference */}
      <Box sx={{ mt: 3, px: '16px', py: '14px', bgcolor: '#fff', border: `1px solid ${alpha(color.neutral[900], 0.08)}`, borderRadius: radius.md }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: text.secondary, mb: 1.25, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role Permissions</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
          {[
            { role: 'Admin', perms: ['Full access', 'Billing', 'Team management', 'Settings', 'API keys'] },
            { role: 'Manager', perms: ['Manage reviews', 'Manage team', 'Automations', 'Reports', 'Integrations'] },
            { role: 'Agent', perms: ['View reviews', 'Respond', 'Escalate', 'View reports'] },
            { role: 'Viewer', perms: ['View reviews', 'View reports', 'View insights'] },
          ].map(r => (
            <Box key={r.role}>
              <StatusBadge label={r.role} variant={roleConfig[r.role as Role].variant} size="xs" />
              <Box sx={{ mt: 0.75, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {r.perms.map(p => (
                  <Typography key={p} sx={{ fontSize: 11, color: text.tertiary }}>· {p}</Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </PageShell>
  );
};
