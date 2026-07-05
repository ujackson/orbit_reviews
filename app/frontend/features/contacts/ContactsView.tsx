// @ts-nocheck
/**
 * View: ContactsView
 * 
 * Mode B - Management Workspace (72 + flex layout)\n * Enterprise contact management with data table and search.
 */

import { Box, Typography, TextField, Button, Chip, Avatar, InputAdornment, IconButton, alpha, Select, MenuItem, Menu } from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  MoreVert as MoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { toast } from 'sonner';
import { SlidePanel } from '../../shared/components/SlidePanel';
import { FormSection } from '../../shared/components/FormSection';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { color, spacing, typography, text, radius } from '../../shared/tokens/design-tokens';
import { getChannelColor } from '@/lib/mockMessages';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  organization?: string;
  tags: string[];
  lastContact: string;
  conversationsCount: number;
  status: 'active' | 'inactive';
  starred: boolean;
  preferredChannel: 'email' | 'sms' | 'whatsapp' | 'slack';
}

export const ContactsView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [starredContacts, setStarredContacts] = useState<Set<string>>(new Set(['1', '3']));
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactOrg, setNewContactOrg] = useState('');
  const [contactMenuAnchor, setContactMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      phone: '+1 (555) 123-4567',
      avatar: 'SJ',
      organization: 'TechCorp Inc.',
      tags: ['Enterprise', 'Priority'],
      lastContact: '2 hours ago',
      conversationsCount: 24,
      status: 'active',
      starred: true,
      preferredChannel: 'email',
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@startup.io',
      phone: '+1 (555) 234-5678',
      avatar: 'MC',
      organization: 'Startup.io',
      tags: ['Sales', 'Demo'],
      lastContact: '1 day ago',
      conversationsCount: 12,
      status: 'active',
      starred: false,
      preferredChannel: 'slack',
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.r@designstudio.com',
      phone: '+1 (555) 345-6789',
      avatar: 'ER',
      organization: 'Design Studio',
      tags: ['Partner', 'VIP'],
      lastContact: '3 days ago',
      conversationsCount: 45,
      status: 'active',
      starred: true,
      preferredChannel: 'email',
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@agency.co',
      avatar: 'DK',
      organization: 'Creative Agency',
      tags: ['Marketing'],
      lastContact: '1 week ago',
      conversationsCount: 8,
      status: 'active',
      starred: false,
      preferredChannel: 'whatsapp',
    },
    {
      id: '5',
      name: 'Jessica Liu',
      email: 'jessica@consultant.com',
      phone: '+1 (555) 456-7890',
      avatar: 'JL',
      tags: ['Consultant'],
      lastContact: '2 weeks ago',
      conversationsCount: 5,
      status: 'inactive',
      starred: false,
      preferredChannel: 'email',
    },
  ]);

  const toggleStar = (contactId: string) => {
    setStarredContacts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
        toast.info('Contact unstarred');
      } else {
        newSet.add(contactId);
        toast.success('Contact starred');
      }
      return newSet;
    });
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName,
      email: newContactEmail,
      phone: newContactPhone || undefined,
      organization: newContactOrg || undefined,
      avatar: newContactName.substring(0, 2).toUpperCase(),
      tags: [],
      lastContact: 'Just now',
      conversationsCount: 0,
      status: 'active',
      starred: false,
      preferredChannel: 'email',
    };

    setContacts(prev => [newContact, ...prev]);
    toast.success('Contact added successfully!');
    setAddPanelOpen(false);
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactOrg('');
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.organization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditPanelOpen(true);
  };

  const handleDeleteContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteContact = () => {
    if (selectedContact) {
      const updatedContacts = contacts.filter((contact) => contact.id !== selectedContact.id);
      toast.success(`Contact ${selectedContact.name} deleted successfully.`);
      setStarredContacts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedContact.id);
        return newSet;
      });
      setSelectedContact(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        height: '100vh',
        overflow: 'auto',
        bgcolor: color.surface.work, // Layer 3 - Work surface
        px: spacing[64],
        py: spacing[48],
      }}
    >
      <Box sx={{ maxWidth: 1200 }}>
        {/* Header */}
        <Box sx={{ mb: spacing[32] }}>
          <Typography
            sx={{
              fontSize: typography.fontSize.xxl,
              fontWeight: typography.fontWeight.semibold,
              color: text.primary,
              mb: spacing[8],
            }}
          >
            Contacts
          </Typography>
          <Typography sx={{ fontSize: typography.fontSize.base, color: text.secondary }}>
            Manage and organize your customer relationships
          </Typography>
        </Box>

        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            gap: spacing[16],
            mb: spacing[32],
          }}
        >
          {/* Search */}
          <TextField
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: color.surface.primary,
                fontSize: typography.fontSize.base,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: text.tertiary }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Filter Button */}
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{
              fontSize: typography.fontSize.base,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              borderColor: alpha(color.neutral[900], 0.12),
              color: text.primary,
            }}
          >
            Filter
          </Button>

          {/* Add Contact Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              fontSize: typography.fontSize.base,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              bgcolor: color.functional.primary,
              color: '#FFFFFF',
              '&:hover': {
                bgcolor: color.functional.primaryHover,
              },
            }}
            onClick={() => setAddPanelOpen(true)}
          >
            Add Contact
          </Button>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: 'flex',
            gap: spacing[24],
            mb: spacing[32],
          }}
        >
          <Box
            sx={{
              flex: 1,
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, mb: spacing[4] }}>
              Total Contacts
            </Typography>
            <Typography sx={{ fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
              {contacts.length}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, mb: spacing[4] }}>
              Active This Week
            </Typography>
            <Typography sx={{ fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
              {contacts.filter((c) => c.status === 'active').length}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: spacing[20],
              borderRadius: radius.base,
              bgcolor: alpha(color.neutral[900], 0.015),
              border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            }}
          >
            <Typography sx={{ fontSize: typography.fontSize.sm, color: text.tertiary, mb: spacing[4] }}>
              Starred
            </Typography>
            <Typography sx={{ fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.semibold, color: text.primary }}>
              {starredContacts.size}
            </Typography>
          </Box>
        </Box>

        {/* Contacts Table */}
        <Box
          sx={{
            bgcolor: color.surface.primary,
            borderRadius: radius.base,
            border: `1px solid ${alpha(color.neutral[900], 0.06)}`,
            overflow: 'hidden',
          }}
        >
          {/* Table Header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '48px 2fr 2fr 1fr 1fr 48px',
              gap: spacing[16],
              p: spacing[16],
              borderBottom: `1px solid ${alpha(color.neutral[900], 0.06)}`,
              bgcolor: alpha(color.neutral[900], 0.015),
            }}
          >
            <Box />
            <Typography sx={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: text.secondary }}>
              Name
            </Typography>
            <Typography sx={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: text.secondary }}>
              Contact Info
            </Typography>
            <Typography sx={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: text.secondary }}>
              Tags
            </Typography>
            <Typography sx={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: text.secondary }}>
              Last Contact
            </Typography>
            <Box />
          </Box>

          {/* Table Rows */}
          {filteredContacts.map((contact) => (
            <Box
              key={contact.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '48px 2fr 2fr 1fr 1fr 48px',
                gap: spacing[16],
                alignItems: 'center',
                p: spacing[16],
                borderBottom: `1px solid ${alpha(color.neutral[900], 0.04)}`,
                transition: 'all 0.12s ease-out',
                '&:hover': {
                  bgcolor: alpha(color.neutral[900], 0.02),
                },
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              {/* Star */}
              <IconButton
                size="small"
                onClick={() => toggleStar(contact.id)}
                sx={{
                  color: starredContacts.has(contact.id) ? color.functional.warning : text.tertiary,
                }}
              >
                {starredContacts.has(contact.id) ? (
                  <StarIcon sx={{ fontSize: 20 }} />
                ) : (
                  <StarBorderIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>

              {/* Name & Organization */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[12] }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: alpha(color.functional.primary, 0.15),
                    color: color.functional.primary,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  {contact.avatar}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: text.primary,
                      mb: spacing[2],
                    }}
                  >
                    {contact.name}
                  </Typography>
                  {contact.organization && (
                    <Typography
                      sx={{
                        fontSize: typography.fontSize.sm,
                        color: text.secondary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[4],
                      }}
                    >
                      <BusinessIcon sx={{ fontSize: 14 }} />
                      {contact.organization}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Contact Info */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.sm,
                    color: text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[8],
                  }}
                >
                  <EmailIcon sx={{ fontSize: 14, color: text.tertiary }} />
                  {contact.email}
                </Typography>
                {contact.phone && (
                  <Typography
                    sx={{
                      fontSize: typography.fontSize.sm,
                      color: text.secondary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[8],
                    }}
                  >
                    <PhoneIcon sx={{ fontSize: 14, color: text.tertiary }} />
                    {contact.phone}
                  </Typography>
                )}
              </Box>

              {/* Tags */}
              <Box sx={{ display: 'flex', gap: spacing[8], flexWrap: 'wrap' }}>
                {contact.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      bgcolor: alpha(color.neutral[900], 0.06),
                      color: text.secondary,
                      borderRadius: radius.sm,
                    }}
                  />
                ))}
              </Box>

              {/* Last Contact */}
              <Box>
                <Typography sx={{ fontSize: typography.fontSize.sm, color: text.secondary, mb: spacing[4] }}>
                  {contact.lastContact}
                </Typography>
                <Typography sx={{ fontSize: typography.fontSize.xs, color: text.tertiary }}>
                  {contact.conversationsCount} conversations
                </Typography>
              </Box>

              {/* Actions */}
              <IconButton size="small" sx={{ color: text.tertiary }}>
                <MoreIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          ))}
        </Box>

        {/* Empty State */}
        {filteredContacts.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: spacing[64],
            }}
          >
            <Typography sx={{ fontSize: typography.fontSize.base, color: text.secondary }}>
              No contacts found matching "{searchQuery}"
            </Typography>
          </Box>
        )}
      </Box>

      {/* Add Contact Panel - Orbit Intelligence */}
      <SlidePanel
        open={addPanelOpen}
        onClose={() => setAddPanelOpen(false)}
        title="Add Contact"
        subtitle="Contacts › New Relationship"
        intelligenceTip="Orbit can suggest contact details from recent conversations"
      >
        <FormSection title="Identity">
          <TextField
            label="Full Name"
            placeholder="e.g., Sarah Johnson"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Organization"
            placeholder="e.g., TechCorp Inc."
            value={newContactOrg}
            onChange={(e) => setNewContactOrg(e.target.value)}
            fullWidth
          />
        </FormSection>

        <FormSection title="Communication" description="Primary contact methods">
          <TextField
            label="Email Address"
            placeholder="name@company.com"
            type="email"
            value={newContactEmail}
            onChange={(e) => setNewContactEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            fullWidth
          />
          <Select
            value="email"
            fullWidth
            displayEmpty
          >
            <MenuItem value="email">Preferred: Email</MenuItem>
            <MenuItem value="sms">Preferred: SMS</MenuItem>
            <MenuItem value="whatsapp">Preferred: WhatsApp</MenuItem>
            <MenuItem value="slack">Preferred: Slack</MenuItem>
          </Select>
        </FormSection>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleAddContact}
          sx={{
            fontSize: typography.fontSize.base,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            bgcolor: color.neutral[900],
            color: '#FFFFFF',
            '&:hover': {
              bgcolor: color.neutral[800],
            },
          }}
        >
          Create Contact
        </Button>
      </SlidePanel>

      {/* Edit Contact Panel */}
      <SlidePanel
        open={isEditPanelOpen}
        onClose={() => setIsEditPanelOpen(false)}
        title="Edit Contact"
      >
        {selectedContact && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[24],
            }}
          >
            <TextField
              label="Name"
              value={selectedContact.name}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: color.surface.primary,
                  fontSize: typography.fontSize.base,
                },
              }}
            />
            <TextField
              label="Email"
              value={selectedContact.email}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: color.surface.primary,
                  fontSize: typography.fontSize.base,
                },
              }}
            />
            <TextField
              label="Phone"
              value={selectedContact.phone || ''}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: color.surface.primary,
                  fontSize: typography.fontSize.base,
                },
              }}
            />
            <TextField
              label="Organization"
              value={selectedContact.organization || ''}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: color.surface.primary,
                  fontSize: typography.fontSize.base,
                },
              }}
            />
            <Select
              label="Preferred Channel"
              value={selectedContact.preferredChannel}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: color.surface.primary,
                  fontSize: typography.fontSize.base,
                },
              }}
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
              <MenuItem value="slack">Slack</MenuItem>
            </Select>
            <Box
              sx={{
                display: 'flex',
                gap: spacing[16],
              }}
            >
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                sx={{
                  fontSize: typography.fontSize.base,
                  textTransform: 'none',
                  fontWeight: typography.fontWeight.medium,
                  bgcolor: color.functional.primary,
                  color: '#FFFFFF',
                  '&:hover': {
                    bgcolor: color.functional.primaryHover,
                  },
                }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                sx={{
                  fontSize: typography.fontSize.base,
                  textTransform: 'none',
                  fontWeight: typography.fontWeight.medium,
                  borderColor: alpha(color.neutral[900], 0.12),
                  color: text.primary,
                }}
                onClick={() => handleDeleteContact(selectedContact)}
              >
                Delete Contact
              </Button>
            </Box>
          </Box>
        )}
      </SlidePanel>

      {/* Delete Contact Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteContact}
        title="Delete Contact?"
        description={`${selectedContact?.name} will be permanently removed from your contacts.`}
        confirmText="Delete"
        confirmColor="error"
        isDestructive
      />
    </Box>
  );
};