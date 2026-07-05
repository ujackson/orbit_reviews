// @ts-nocheck
/**
 * Component: TasksTab
 * 
 * Context Panel Intelligence: Tasks view
 * Shows related tasks, allows task creation from conversation
 */

import { Box, Typography, Button, Chip, IconButton, alpha, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
  Add as AddIcon,
  CheckCircleOutline as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { useState, type MouseEvent } from 'react';
import { toast } from 'sonner';
import { Message } from '../../../inbox/types';
import { color, spacing, typography, text, radius } from '../../../../shared/tokens/design-tokens';

interface TasksTabProps {
  conversation: Message;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  priority: 'high' | 'normal';
}

export const TasksTab = ({ conversation }: TasksTabProps) => {
  // Mock tasks data (in real app, fetch from API based on conversation)
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Follow up on pricing question',
      completed: false,
      dueDate: 'Tomorrow',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Send product documentation',
      completed: true,
      dueDate: 'Today',
      priority: 'normal',
    },
  ]);

  const [taskMenuAnchor, setTaskMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const toggleTaskComplete = (taskId: string) => {
    const task = tasks.find((candidate) => candidate.id === taskId);

    setTasks((prev) =>
      prev.map((candidate) =>
        candidate.id === taskId ? { ...candidate, completed: !candidate.completed } : candidate
      )
    );

    if (task) {
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!');
    }
  };

  const handleCreateTask = () => {
    toast.info('Create Task panel will open here');
  };

  const handleTaskMenuOpen = (event: MouseEvent<HTMLButtonElement>, taskId: string) => {
    setTaskMenuAnchor(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const handleTaskMenuClose = () => {
    setTaskMenuAnchor(null);
    setSelectedTaskId(null);
  };

  const handleEditTask = () => {
    handleTaskMenuClose();
    toast.info('Edit task dialog will open here');
  };

  const handleDeleteTask = () => {
    if (selectedTaskId) {
      setTasks((prev) => prev.filter((task) => task.id !== selectedTaskId));
      toast.success('Task deleted');
    }

    handleTaskMenuClose();
  };

  const handleChangeDueDate = () => {
    handleTaskMenuClose();
    toast.info('Date picker will open here');
  };

  const handleChangePriority = () => {
    handleTaskMenuClose();
    toast.info('Priority selector will open here');
  };

  return (
    <Box>
      {/* Create Task Button */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleCreateTask}
        sx={{
          mb: spacing[24],
          py: spacing[12],
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.medium,
          textTransform: 'none',
          borderColor: alpha(color.neutral[900], 0.12),
          color: text.primary,
          '&:hover': {
            borderColor: color.functional.primary,
            bgcolor: alpha(color.functional.primary, 0.04),
          },
        }}
      >
        Create Task from Conversation
      </Button>

      {/* Section Header */}
      <Typography
        sx={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: text.primary,
          mb: spacing[16],
        }}
      >
        Related Tasks ({tasks.length})
      </Typography>

      {/* Tasks List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[12] }}>
        {tasks.map((task) => (
          <Box
            key={task.id}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: spacing[12],
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
            {/* Checkbox */}
            <IconButton
              size="small"
              onClick={() => toggleTaskComplete(task.id)}
              sx={{
                mt: '-2px',
                color: task.completed ? color.functional.success : text.tertiary,
                '&:hover': {
                  bgcolor: alpha(
                    task.completed ? color.functional.success : color.functional.primary,
                    0.08
                  ),
                },
              }}
            >
              {task.completed ? (
                <CheckIcon sx={{ fontSize: 20 }} />
              ) : (
                <UncheckedIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>

            {/* Task Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  color: task.completed ? text.tertiary : text.primary,
                  textDecoration: task.completed ? 'line-through' : 'none',
                  mb: spacing[8],
                }}
              >
                {task.title}
              </Typography>

              {/* Metadata */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8], flexWrap: 'wrap' }}>
                <Chip
                  label={task.dueDate}
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
                {task.priority === 'high' && (
                  <Chip
                    label="High Priority"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      bgcolor: alpha(color.functional.warning, 0.1),
                      color: color.functional.warning,
                      borderRadius: radius.sm,
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Actions */}
            <IconButton
              size="small"
              onClick={(event) => handleTaskMenuOpen(event, task.id)}
              sx={{
                mt: '-2px',
                color: text.tertiary,
                '&:hover': {
                  bgcolor: alpha(color.neutral[900], 0.06),
                },
              }}
            >
              <MoreIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        ))}
      </Box>

      {/* Task Actions Menu */}
      <Menu
        anchorEl={taskMenuAnchor}
        open={Boolean(taskMenuAnchor)}
        onClose={handleTaskMenuClose}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: radius.base,
            minWidth: 200,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <MenuItem onClick={handleEditTask}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit Task" primaryTypographyProps={{ fontSize: typography.fontSize.sm }} />
        </MenuItem>
        <MenuItem onClick={handleChangeDueDate}>
          <ListItemIcon>
            <CalendarIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Change Due Date" primaryTypographyProps={{ fontSize: typography.fontSize.sm }} />
        </MenuItem>
        <MenuItem onClick={handleChangePriority}>
          <ListItemIcon>
            <FlagIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Change Priority" primaryTypographyProps={{ fontSize: typography.fontSize.sm }} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteTask} sx={{ color: color.functional.error }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete Task" primaryTypographyProps={{ fontSize: typography.fontSize.sm }} />
        </MenuItem>
      </Menu>

      {/* AI Suggestion Hint */}
      <Box
        sx={{
          mt: spacing[24],
          p: spacing[16],
          borderRadius: radius.base,
          bgcolor: alpha(color.ai[500], 0.04),
          border: `1px solid ${alpha(color.ai[500], 0.12)}`,
        }}
      >
        <Typography
          sx={{
            fontSize: typography.fontSize.sm,
            color: text.secondary,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: text.primary }}>AI Suggestion:</strong> Based on this
          conversation, you might want to create a task: "Schedule demo call with{' '}
          {conversation.sender.name}"
        </Typography>
      </Box>
    </Box>
  );
};
