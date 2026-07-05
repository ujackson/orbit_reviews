/**
 * Component: UsersRolesSettings
 * 
 * Enterprise user and role management - RBAC controls.
 * Google Workspace / Slack admin style with clear role indicators.
 * Uses slide panel for invites, inline dropdowns for role changes.
 */

import { Box, Button, Chip, Typography, Avatar, IconButton, alpha, Select, MenuItem, Menu, TextField } from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  AdminPanelSettings as AdminIcon,
  Support as SupportIcon,
  Groups as TeamIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { toast } from 'sonner';
import { SettingSection } from '../patterns/SettingSection';
import { SettingRow } from '../patterns/SettingRow';
import { SlidePanel } from '../../../shared/components/SlidePanel';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { color, spacing, typography, text, radius } from '../../../shared/tokens/design-tokens';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'admin' | 'manager' | 'agent';
  status: 'active' | 'invited' | 'inactive';
  lastActive?: string;
  conversationsHandled?: number;
  mfaEnabled?: boolean;
  isExternal?: boolean;
  trustedDevice?: boolean;
  lastLogin?: string;
}

export const UsersRolesSettings = () => {
  // Permission toggles
  const [allowInvitations, setAllowInvitations] = useState(true);
  const [requireMFA, setRequireMFA] = useState(false);
  const [allowExternalSharing, setAllowExternalSharing] = useState(false);

  // Invite panel
  const [invitePanelOpen, setInvitePanelOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<User['role']>('agent');

  // User action menu
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Confirm dialogs
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@orbit.com',
      avatar: 'SC',
      role: 'owner',
      status: 'active',
      lastActive: '2 minutes ago',
      conversationsHandled: 247,
      mfaEnabled: true,
      trustedDevice: true,
      lastLogin: '2 minutes ago',
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      email: 'michael.r@orbit.com',
      avatar: 'MR',
      role: 'admin',
      status: 'active',
      lastActive: '15 minutes ago',
      conversationsHandled: 189,
      mfaEnabled: true,
      trustedDevice: true,
      lastLogin: '15 minutes ago',
    },
    {
      id: '3',
      name: 'Emily Watson',
      email: 'emily.watson@orbit.com',
      avatar: 'EW',
      role: 'manager',
      status: 'active',
      lastActive: '1 hour ago',
      conversationsHandled: 156,
      mfaEnabled: false,
      trustedDevice: true,
      lastLogin: '1 hour ago',
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@orbit.com',
      avatar: 'DK',
      role: 'agent',
      status: 'active',
      lastActive: '5 hours ago',
      conversationsHandled: 423,
      mfaEnabled: true,
      trustedDevice: true,
      lastLogin: '3 days ago',
    },
    {
      id: '5',
      name: 'Jessica Liu',
      email: 'jessica.liu@orbit.com',
      avatar: 'JL',
      role: 'agent',
      status: 'invited',
    },
    {
      id: '6',
      name: 'Alex Thompson',
      email: 'alex@external-agency.com',
      avatar: 'AT',
      role: 'agent',
      status: 'active',
      lastActive: '2 days ago',
      conversationsHandled: 67,
      mfaEnabled: false,
      isExternal: true,
      trustedDevice: false,
      lastLogin: '2 days ago',
    },
  ]);

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      avatar: inviteEmail.substring(0, 2).toUpperCase(),
      role: inviteRole,
      status: 'invited',
    };

    setUsers(prev => [...prev, newUser]);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInvitePanelOpen(false);
    setInviteEmail('');
    setInviteRole('agent');
  };

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    toast.success('Role updated successfully');
  };

  const handleResendInvite = (user: User) => {
    toast.success(`Invitation resent to ${user.email}`);
    setUserMenuAnchor(null);
  };

  const handleRemoveUser = () => {
    if (selectedUser) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      toast.success(`${selectedUser.name} removed from workspace`);
      setSelectedUser(null);
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'owner':
        return color.functional.error;
      case 'admin':
        return color.ai[500];
      case 'manager':
        return color.functional.warning;
      case 'agent':
        return color.functional.info;
    }
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'agent':
        return 'Agent';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return color.functional.success;
      case 'invited':
        return color.functional.warning;
      case 'inactive':
        return text.tertiary;
    }
  };

  return (
    <Box>
      {/* Team Members */}
      <SettingSection
        title="Team Members"
        description="Manage workspace members and their roles"
        isFirst
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              fontSize: typography.fontSize.sm,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              bgcolor: color.functional.primary,
              color: '#FFFFFF',
              '&:hover': {
                bgcolor: color.functional.primaryHover,
              },
            }}
            onClick={() => setInvitePanelOpen(true)}
          >
            Invite Member
          </Button>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[12] }}>
          {users.map((user) => (
            <Box
              key={user.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[16],
                p: spacing[16],
                borderRadius: radius.base,
                bgcolor: alpha(color.neutral[900], 0.015),
                border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
                transition: 'all 0.12s ease-out',
                '&:hover': {
                  bgcolor: alpha(color.neutral[900], 0.025),
                  borderColor: alpha(color.neutral[900], 0.12),
                },
              }}
            >
              {/* Avatar */}
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: alpha(color.functional.primary, 0.15),
                  color: color.functional.primary,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {user.avatar}
              </Avatar>

              {/* User Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8], mb: spacing[4] }}>
                  <Typography
                    sx={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: text.primary,
                    }}
                  >
                    {user.name}
                  </Typography>
                  
                  {/* Governance Signals */}
                  {user.mfaEnabled && (
                    <VerifiedIcon
                      sx={{
                        fontSize: 16,
                        color: color.functional.success,
                      }}
                      titleAccess="MFA Enabled"
                    />
                  )}
                  {user.isExternal && (
                    <Chip
                      label="External"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium,
                        bgcolor: alpha(color.functional.warning, 0.1),
                        color: color.functional.warning,
                        borderRadius: radius.sm,
                      }}
                    />
                  )}
                  {user.status === 'invited' && (
                    <Chip
                      label="Invited"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium,
                        bgcolor: alpha(getStatusColor(user.status), 0.1),
                        color: getStatusColor(user.status),
                        borderRadius: radius.sm,
                      }}
                    />
                  )}
                </Box>

                <Typography
                  sx={{
                    fontSize: typography.fontSize.sm,
                    color: text.secondary,
                    mb: spacing[6],
                  }}
                >
                  {user.email}
                </Typography>

                {user.status === 'active' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: spacing[12] }}>
                    <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
                      {getRoleLabel(user.role)}
                    </Typography>
                    {user.mfaEnabled && (
                      <>
                        <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: text.tertiary }} />
                        <Typography sx={{ fontSize: typography.fontSize.xs, color: color.functional.success }}>
                          MFA Enabled
                        </Typography>
                      </>
                    )}
                    {user.trustedDevice && (
                      <>
                        <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: text.tertiary }} />
                        <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
                          Trusted Device
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>

              {/* Role Select (Inline) */}
              <Select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                disabled={user.role === 'owner'}
                size="small"
                sx={{
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.medium,
                  bgcolor: alpha(getRoleColor(user.role), 0.1),
                  color: getRoleColor(user.role),
                  borderRadius: radius.sm,
                  '& .MuiOutline-notchedOutline': {
                    border: 'none',
                  },
                  '&:hover .MuiOutline-notchedOutline': {
                    border: 'none',
                  },
                  '&.Mui-focused .MuiOutline-notchedOutline': {
                    border: 'none',
                  },
                  '& .MuiSelect-select': {
                    py: spacing[4],
                    px: spacing[12],
                  },
                }}
              >
                <MenuItem value="owner" disabled>Owner</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="agent">Agent</MenuItem>
              </Select>

              {/* Actions */}
              <IconButton
                size="small"
                sx={{ color: text.tertiary }}
                onClick={(e) => {
                  setUserMenuAnchor(e.currentTarget);
                  setSelectedUser(user);
                }}
              >
                <MoreIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      </SettingSection>

      {/* Roles & Permissions */}
      <SettingSection
        title="Roles & Permissions"
        description="Define what each role can do in your workspace"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[16] }}>
          {/* Owner */}
          <Box
            sx={{
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[16] }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.base,
                  bgcolor: alpha(color.functional.error, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AdminIcon sx={{ fontSize: 20, color: color.functional.error }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: text.primary,
                    mb: spacing[4],
                  }}
                >
                  Owner
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary, mb: spacing[12] }}>
                  Full access to all workspace settings, billing, and user management
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing[8] }}>
                  {['Billing', 'Delete workspace', 'Transfer ownership', 'All permissions'].map((perm) => (
                    <Chip
                      key={perm}
                      label={perm}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: typography.fontSize.xs,
                        bgcolor: alpha(color.neutral[900], 0.06),
                        color: text.secondary,
                        borderRadius: radius.sm,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Admin */}
          <Box
            sx={{
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[16] }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.base,
                  bgcolor: alpha(color.ai[500], 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AdminIcon sx={{ fontSize: 20, color: color.ai[500] }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: text.primary,
                    mb: spacing[4],
                  }}
                >
                  Admin
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary, mb: spacing[12] }}>
                  Manage users, integrations, and workspace settings (no billing access)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing[8] }}>
                  {['Manage users', 'Integrations', 'Rules', 'Analytics'].map((perm) => (
                    <Chip
                      key={perm}
                      label={perm}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: typography.fontSize.xs,
                        bgcolor: alpha(color.neutral[900], 0.06),
                        color: text.secondary,
                        borderRadius: radius.sm,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Manager */}
          <Box
            sx={{
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[16] }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.base,
                  bgcolor: alpha(color.functional.warning, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <TeamIcon sx={{ fontSize: 20, color: color.functional.warning }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: text.primary,
                    mb: spacing[4],
                  }}
                >
                  Manager
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary, mb: spacing[12] }}>
                  View team analytics, assign conversations, and create rules
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing[8] }}>
                  {['Assign conversations', 'Team analytics', 'Create rules', 'View all messages'].map((perm) => (
                    <Chip
                      key={perm}
                      label={perm}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: typography.fontSize.xs,
                        bgcolor: alpha(color.neutral[900], 0.06),
                        color: text.secondary,
                        borderRadius: radius.sm,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Agent */}
          <Box
            sx={{
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing[16] }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.base,
                  bgcolor: alpha(color.functional.info, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <SupportIcon sx={{ fontSize: 20, color: color.functional.info }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: text.primary,
                    mb: spacing[4],
                  }}
                >
                  Agent
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary, mb: spacing[12] }}>
                  Handle assigned conversations and use AI suggestions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing[8] }}>
                  {['Reply to messages', 'Use AI drafts', 'View assigned', 'Create tasks'].map((perm) => (
                    <Chip
                      key={perm}
                      label={perm}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: typography.fontSize.xs,
                        bgcolor: alpha(color.neutral[900], 0.06),
                        color: text.secondary,
                        borderRadius: radius.sm,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </SettingSection>

      {/* Access Control */}
      <SettingSection
        title="Access Control"
        description="Configure workspace-wide access and security policies"
      >
        <SettingRow
          label="Allow members to invite others"
          description="Team members can send workspace invitations"
          value={allowInvitations}
          onChange={setAllowInvitations}
        />
        <SettingRow
          label="Require multi-factor authentication"
          description="All users must enable MFA to access workspace"
          value={requireMFA}
          onChange={setRequireMFA}
        />
        <SettingRow
          label="Allow external sharing"
          description="Users can share conversations outside the workspace"
          value={allowExternalSharing}
          onChange={setAllowExternalSharing}
        />
      </SettingSection>

      {/* Invite Member Slide Panel */}
      <SlidePanel
        open={invitePanelOpen}
        onClose={() => setInvitePanelOpen(false)}
        title="Invite Team Member"
        subtitle="Send an invitation to join your workspace"
        width={480}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[24] }}>
          <TextField
            label="Email Address"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            fullWidth
            autoFocus
          />

          <Box>
            <Typography
              sx={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: text.primary,
                mb: spacing[8],
              }}
            >
              Role
            </Typography>
            <Select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as User['role'])}
              fullWidth
            >
              <MenuItem value="agent">Agent - Handle conversations</MenuItem>
              <MenuItem value="manager">Manager - Team oversight</MenuItem>
              <MenuItem value="admin">Admin - Full settings access</MenuItem>
            </Select>
          </Box>

          <Box
            sx={{
              p: spacing[16],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.02),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary }}>
              They'll receive an email invitation to join your workspace with {getRoleLabel(inviteRole).toLowerCase()} permissions.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<SendIcon />}
            sx={{
              fontSize: typography.fontSize.sm,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              bgcolor: color.functional.primary,
              color: '#FFFFFF',
              '&:hover': {
                bgcolor: color.functional.primaryHover,
              },
            }}
            onClick={handleInvite}
          >
            Send Invitation
          </Button>
        </Box>
      </SlidePanel>

      {/* User Action Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
      >
        {selectedUser?.status === 'invited' && (
          <MenuItem
            onClick={() => {
              handleResendInvite(selectedUser);
            }}
          >
            <SendIcon sx={{ fontSize: 18, mr: spacing[12] }} />
            Resend Invitation
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setUserMenuAnchor(null);
            setConfirmRemoveOpen(true);
          }}
          sx={{ color: color.functional.error }}
        >
          <DeleteIcon sx={{ fontSize: 18, mr: spacing[12] }} />
          Remove from Workspace
        </MenuItem>
      </Menu>

      {/* Remove User Confirmation */}
      <ConfirmDialog
        open={confirmRemoveOpen}
        onClose={() => setConfirmRemoveOpen(false)}
        onConfirm={handleRemoveUser}
        title="Remove Team Member?"
        description={`${selectedUser?.name} will lose access to this workspace and all conversations.`}
        confirmText="Remove"
        confirmColor="error"
        isDestructive
      />
    </Box>
  );
};
