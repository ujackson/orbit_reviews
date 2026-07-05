/**
 * Component: OnboardingIntegrationPicker
 * Streamlined integration picker for onboarding flow
 */

import { Box, Typography, FormLabel, alpha } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useState } from 'react';
import { IntegrationDefinition, IntegrationCategory } from '../types';
import { INTEGRATIONS } from '../data/integrations';
import { OAuthConnectDialog } from './OAuthConnectDialog';
import { ApiKeyConnectDialog } from './ApiKeyConnectDialog';
import { getMuiIcon } from '../utils/getMuiIcon';
import { color } from '../../../shared/tokens/design-tokens';

interface OnboardingIntegrationPickerProps {
  selectedIntegrationIds: string[];
  onSelect: (integrationId: string) => void;
  onConnect?: (integrationId: string, credentials?: any) => void;
  categories?: IntegrationCategory[];
  maxSelections?: number;
  title?: string;
  description?: string;
}

export const OnboardingIntegrationPicker = ({
  selectedIntegrationIds = [],
  onSelect,
  onConnect,
  categories = ['communication', 'social'],
  maxSelections = 6,
  title = "Which channels do you want to connect?",
  description = "Select the platforms where you communicate with customers",
}: OnboardingIntegrationPickerProps) => {
  const [oauthDialogOpen, setOauthDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDefinition | null>(null);

  // Filter integrations by category and popular status
  const availableIntegrations = INTEGRATIONS
    .filter((int) => categories.includes(int.category))
    .filter((int) => int.popular || int.recommended)
    .slice(0, maxSelections);

  const handleIntegrationClick = (integration: IntegrationDefinition) => {
    const isSelected = selectedIntegrationIds.includes(integration.id);
    
    if (isSelected) {
      // Deselect
      onSelect(integration.id);
    } else {
      // Select and optionally trigger connection flow
      onSelect(integration.id);
      
      if (onConnect) {
        setSelectedIntegration(integration);
        if (integration.type === 'oauth') {
          setOauthDialogOpen(true);
        } else if (integration.type === 'api_key') {
          setApiKeyDialogOpen(true);
        }
      }
    }
  };

  const handleOAuthConnect = (integrationId: string, accountInfo?: any) => {
    if (onConnect) {
      onConnect(integrationId, accountInfo);
    }
  };

  const handleApiKeyConnect = (integrationId: string, credentials: Record<string, string>) => {
    if (onConnect) {
      onConnect(integrationId, credentials);
    }
  };

  return (
    <Box>
      <FormLabel sx={{ mb: 1.5, fontSize: 14 }}>{title}</FormLabel>
      <Typography variant="body2" sx={{ color: color.neutral[600], mb: 2, fontSize: 12 }}>
        {description}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
        {availableIntegrations.map((integration) => {
          const Icon = getMuiIcon(integration.icon);
          const isSelected = selectedIntegrationIds.includes(integration.id);

          return (
            <Box
              key={integration.id}
              onClick={() => handleIntegrationClick(integration)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                p: 2,
                border: `2px solid ${
                  isSelected ? integration.color : color.neutral[200]
                }`,
                borderRadius: 1.5,
                cursor: 'pointer',
                backgroundColor: isSelected
                  ? alpha(integration.color, 0.1)
                  : color.surface.primary,
                transition: 'all 0.2s',
                position: 'relative',
                '&:hover': {
                  borderColor: integration.color,
                  backgroundColor: alpha(integration.color, 0.08),
                },
              }}
            >
              <Box sx={{ color: integration.color, fontSize: 24 }}>
                <Icon sx={{ fontSize: 'inherit' }} />
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 500, textAlign: 'center' }}>
                {integration.name}
              </Typography>
              {isSelected && (
                <CheckCircleIcon
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontSize: 16,
                    color: integration.color,
                  }}
                />
              )}
              {integration.popular && !isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 0.75,
                    bgcolor: alpha(color.ai[500], 0.1),
                    color: color.ai[700],
                    fontSize: 9,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  Popular
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Typography
        variant="body2"
        sx={{
          color: color.neutral[500],
          fontSize: 11,
          mt: 1.5,
          textAlign: 'center',
        }}
      >
        You can connect more integrations later in Settings
      </Typography>

      {/* OAuth Connect Dialog */}
      <OAuthConnectDialog
        open={oauthDialogOpen}
        integration={selectedIntegration}
        onClose={() => {
          setOauthDialogOpen(false);
          setSelectedIntegration(null);
        }}
        onConnect={handleOAuthConnect}
      />

      {/* API Key Connect Dialog */}
      <ApiKeyConnectDialog
        open={apiKeyDialogOpen}
        integration={selectedIntegration}
        onClose={() => {
          setApiKeyDialogOpen(false);
          setSelectedIntegration(null);
        }}
        onConnect={handleApiKeyConnect}
      />
    </Box>
  );
};
