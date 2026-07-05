// @ts-nocheck
/**
 * Component: SuggestedActionsPanel (Orbit Intelligence)
 * 
 * Context-aware quick actions with intelligent forms.
 * Not CRUD - operational intelligence.
 */

import { Box, Button, TextField, Select, MenuItem, Typography, alpha, Collapse } from '@mui/material';
import { ChevronRight as ChevronRightIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useState } from 'react';
import { toast } from 'sonner';
import { SlidePanel } from '../../../shared/components/SlidePanel';
import { FormSection } from '../../../shared/components/FormSection';
import { color, spacing, typography, radius, text, transition } from '../../../shared/tokens/design-tokens';

interface SuggestedAction {
  id: string;
  label: string;
  action: string;
}

interface SuggestedActionsPanelProps {
  actions: SuggestedAction[];
}

export const SuggestedActionsPanel = ({ actions }: SuggestedActionsPanelProps) => {
  // Panel states
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const [followUpPanelOpen, setFollowUpPanelOpen] = useState(false);
  const [assignPanelOpen, setAssignPanelOpen] = useState(false);

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Follow-up form
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');

  // Assign form
  const [assignTo, setAssignTo] = useState('');

  const handleActionClick = (actionType: string) => {
    switch (actionType) {
      case 'create_task':
        setTaskPanelOpen(true);
        break;
      case 'create_follow_up':
      case 'follow_up':
      case 'schedule':
        setFollowUpPanelOpen(true);
        break;
      case 'assign':
      case 'route':
        setAssignPanelOpen(true);
        break;
      default:
        toast.info(`${actionType} coming soon!`);
    }
  };

  const handleCreateTask = () => {
    if (!taskTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    toast.success('Task created successfully!');
    setTaskPanelOpen(false);
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setTaskDueDate('');
  };

  const handleScheduleFollowUp = () => {
    if (!followUpDate || !followUpTime) {
      toast.error('Please select date and time');
      return;
    }

    toast.success('Follow-up scheduled successfully!');
    setFollowUpPanelOpen(false);
    setFollowUpDate('');
    setFollowUpTime('');
    setFollowUpNote('');
  };

  const handleAssign = () => {
    if (!assignTo) {
      toast.error('Please select a team member');
      return;
    }

    toast.success(`Conversation assigned to ${assignTo}`);
    setAssignPanelOpen(false);
    setAssignTo('');
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[8] }}>
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outlined"
            size="small"
            endIcon={<ChevronRightIcon />}
            onClick={() => handleActionClick(action.action)}
            sx={{
              justifyContent: 'space-between',
              textTransform: 'none',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              borderRadius: radius.base,
              borderColor: color.neutral[300],
              color: text.primary,
              bgcolor: color.surface.primary,
              transition: `all ${transition.duration.fast} ${transition.easing.base}`,
              '&:hover': {
                bgcolor: alpha(color.ai[500], 0.05),
                borderColor: color.ai[600],
                color: color.ai[700],
              },
            }}
          >
            {action.label}
          </Button>
        ))}
      </Box>

      {/* Create Task Panel - Orbit Intelligence */}
      <SlidePanel
        open={taskPanelOpen}
        onClose={() => setTaskPanelOpen(false)}
        title="Create Task"
        subtitle="AI › Conversation Actions"
        intelligenceTip="Orbit can auto-populate task details from conversation context"
      >
        <FormSection title="Task Details">
          <TextField
            label="Title"
            placeholder="e.g., Send Q4 roadmap document"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            fullWidth
            autoFocus
          />

          <TextField
            label="Description"
            placeholder="Add context from this conversation..."
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </FormSection>

        <FormSection title="Scheduling">
          <Select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
            fullWidth
            displayEmpty
          >
            <MenuItem value="low">Low Priority</MenuItem>
            <MenuItem value="medium">Medium Priority</MenuItem>
            <MenuItem value="high">High Priority</MenuItem>
          </Select>

          <TextField
            label="Due Date"
            type="date"
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </FormSection>

        <Button
          variant="contained"
          size="large"
          onClick={handleCreateTask}
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
          Create Task
        </Button>
      </SlidePanel>

      {/* Schedule Follow-up Panel - Orbit Intelligence */}
      <SlidePanel
        open={followUpPanelOpen}
        onClose={() => setFollowUpPanelOpen(false)}
        title="Schedule Follow-up"
        subtitle="AI › Conversation Reminders"
        intelligenceTip="Orbit will notify you at the scheduled time with conversation context"
      >
        <FormSection title="Schedule">
          <TextField
            label="Date"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            autoFocus
          />

          <TextField
            label="Time"
            type="time"
            value={followUpTime}
            onChange={(e) => setFollowUpTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </FormSection>

        <FormSection title="Notes" description="Optional reminder context">
          <TextField
            placeholder="Why are you following up on this?"
            value={followUpNote}
            onChange={(e) => setFollowUpNote(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </FormSection>

        <Button
          variant="contained"
          size="large"
          onClick={handleScheduleFollowUp}
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
          Schedule Reminder
        </Button>
      </SlidePanel>

      {/* Assign Conversation Panel - Orbit Intelligence */}
      <SlidePanel
        open={assignPanelOpen}
        onClose={() => setAssignPanelOpen(false)}
        title="Assign Conversation"
        subtitle="AI › Team Routing"
        intelligenceTip="Orbit can suggest the best team member based on expertise and workload"
      >
        <FormSection title="Assignment" description="Route this conversation to a team member">
          <Select
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
            fullWidth
            displayEmpty
            autoFocus
          >
            <MenuItem value="" disabled>
              Select team member...
            </MenuItem>
            <MenuItem value="Sarah Chen">Sarah Chen (Owner)</MenuItem>
            <MenuItem value="Michael Rodriguez">Michael Rodriguez (Admin)</MenuItem>
            <MenuItem value="Emily Watson">Emily Watson (Manager)</MenuItem>
            <MenuItem value="David Kim">David Kim (Agent)</MenuItem>
          </Select>
        </FormSection>

        <Button
          variant="contained"
          size="large"
          onClick={handleAssign}
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
          Assign to Team Member
        </Button>
      </SlidePanel>
    </>
  );
};
