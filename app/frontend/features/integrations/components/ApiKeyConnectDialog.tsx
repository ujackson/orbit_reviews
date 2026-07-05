/**
 * Component: ApiKeyConnectDialog
 * Enterprise API key connection flow with field validation
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  alpha,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { toast } from 'sonner';
import { IntegrationDefinition } from '../types';
import { color, spacing, typography, text, radius } from '../../../shared/tokens/design-tokens';
import { getMuiIcon } from '../utils/getMuiIcon';

interface ApiKeyConnectDialogProps {
  open: boolean;
  integration: IntegrationDefinition | null;
  onClose: () => void;
  onConnect: (integrationId: string, credentials: Record<string, string>) => void;
}

export const ApiKeyConnectDialog = ({
  open,
  integration,
  onClose,
  onConnect,
}: ApiKeyConnectDialogProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!integration) return null;

  const Icon = getMuiIcon(integration.icon);
  const fields = integration.apiKeyFields || [];

  const handleChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConnect = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsConnecting(true);
    toast.loading('Verifying credentials...');

    // Simulate API validation
    setTimeout(() => {
      toast.dismiss();
      toast.success(`${integration.name} connected successfully!`);
      onConnect(integration.id, formData);
      setIsConnecting(false);
      setFormData({});
      setErrors({});
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    setShowPassword({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: radius.md,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[16] }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: radius.base,
              bgcolor: alpha(integration.color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: integration.color,
              fontSize: 24,
            }}
          >
            <Icon sx={{ fontSize: 'inherit' }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: text.primary,
              }}
            >
              Connect {integration.name}
            </Typography>
            <Typography
              sx={{
                fontSize: typography.fontSize.sm,
                color: text.secondary,
              }}
            >
              via API credentials
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[24], pt: spacing[8] }}>
          {/* Description */}
          <Typography
            sx={{
              fontSize: typography.fontSize.sm,
              color: text.secondary,
            }}
          >
            {integration.description}
          </Typography>

          {/* Security notice */}
          <Alert
            icon={<SecurityIcon fontSize="small" />}
            severity="info"
            sx={{
              bgcolor: alpha(color.functional.info, 0.08),
              color: text.primary,
              '& .MuiAlert-icon': {
                color: color.functional.info,
              },
            }}
          >
            <Typography sx={{ fontSize: typography.fontSize.sm }}>
              Your API credentials are encrypted and stored securely. Orbit will never share your
              credentials with third parties.
            </Typography>
          </Alert>

          {/* API Key Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[16] }}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                placeholder={field.placeholder}
                type={
                  field.type === 'password'
                    ? showPassword[field.name]
                      ? 'text'
                      : 'password'
                    : 'text'
                }
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                error={!!errors[field.name]}
                helperText={errors[field.name] || field.helperText}
                fullWidth
                disabled={isConnecting}
                InputProps={
                  field.type === 'password'
                    ? {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility(field.name)}
                              edge="end"
                              size="small"
                              sx={{ color: text.tertiary }}
                            >
                              {showPassword[field.name] ? (
                                <VisibilityOffIcon fontSize="small" />
                              ) : (
                                <VisibilityIcon fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    : undefined
                }
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: typography.fontSize.sm,
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: typography.fontSize.sm,
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: typography.fontSize.xs,
                  },
                }}
              />
            ))}
          </Box>

          {/* Documentation link */}
          {(integration.docsUrl || integration.setupGuideUrl) && (
            <Button
              variant="text"
              size="small"
              endIcon={<OpenIcon sx={{ fontSize: 14 }} />}
              onClick={() =>
                window.open(integration.setupGuideUrl || integration.docsUrl, '_blank')
              }
              sx={{
                fontSize: typography.fontSize.sm,
                textTransform: 'none',
                fontWeight: typography.fontWeight.medium,
                color: color.functional.primary,
                alignSelf: 'flex-start',
                px: 0,
                '&:hover': {
                  bgcolor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              How to get API credentials
            </Button>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: spacing[20], pt: 0 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={isConnecting}
          sx={{
            fontSize: typography.fontSize.sm,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            borderColor: alpha(color.neutral[900], 0.12),
            color: text.primary,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConnect}
          disabled={isConnecting}
          sx={{
            fontSize: typography.fontSize.sm,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            bgcolor: color.functional.primary,
            color: '#FFFFFF',
            minWidth: 120,
            '&:hover': {
              bgcolor: color.functional.primaryHover,
            },
          }}
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
