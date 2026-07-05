/**
 * Component: ConfirmDialog
 * 
 * Small confirmation dialog for destructive actions.
 * Minimal, focused - not a full modal takeover.
 */

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, alpha } from '@mui/material';
import { color, spacing, typography, text } from '../tokens/design-tokens';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  confirmColor?: 'error' | 'primary';
  isDestructive?: boolean;
}

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  confirmColor = 'primary',
  isDestructive = false,
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: text.primary,
          pb: spacing[12],
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography
          sx={{
            fontSize: typography.fontSize.sm,
            color: text.secondary,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: spacing[20], pt: spacing[16] }}>
        <Button
          variant="outlined"
          size="medium"
          onClick={onClose}
          sx={{
            fontSize: typography.fontSize.sm,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            borderColor: alpha(color.neutral[900], 0.12),
            color: text.primary,
            '&:hover': {
              borderColor: alpha(color.neutral[900], 0.24),
              bgcolor: alpha(color.neutral[900], 0.02),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={handleConfirm}
          sx={{
            fontSize: typography.fontSize.sm,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            bgcolor: (isDestructive || confirmColor === 'error') ? color.functional.error : color.functional.primary,
            color: '#FFFFFF',
            '&:hover': {
              bgcolor: (isDestructive || confirmColor === 'error')
                ? color.functional.error
                : color.functional.primaryHover,
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
