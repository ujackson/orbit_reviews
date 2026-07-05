/**
 * Component: IntegrationCatalog
 * Searchable, filterable catalog of 50+ integrations
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  alpha,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { IntegrationDefinition, IntegrationConnection, IntegrationCategory } from '../types';
import { INTEGRATIONS, CATEGORIES } from '../data/integrations';
import { IntegrationCard } from './IntegrationCard';
import { OAuthConnectDialog } from './OAuthConnectDialog';
import { ApiKeyConnectDialog } from './ApiKeyConnectDialog';
import { color, spacing, typography, text } from '../../../shared/tokens/design-tokens';

interface IntegrationCatalogProps {
  connections?: IntegrationConnection[];
  onConnect?: (integrationId: string, credentials?: any) => void;
  onDisconnect?: (connection: IntegrationConnection) => void;
  onSettings?: (connection: IntegrationConnection) => void;
  compact?: boolean;
  filterCategories?: IntegrationCategory[];
  showSearch?: boolean;
  showTabs?: boolean;
  maxItems?: number;
}

export const IntegrationCatalog = ({
  connections = [],
  onConnect,
  onDisconnect,
  onSettings,
  compact = false,
  filterCategories,
  showSearch = true,
  showTabs = true,
  maxItems,
}: IntegrationCatalogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all' | 'popular'>('all');
  const [oauthDialogOpen, setOauthDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDefinition | null>(null);

  // Filter integrations
  const filteredIntegrations = useMemo(() => {
    let filtered = INTEGRATIONS;

    // Apply category filter from props
    if (filterCategories && filterCategories.length > 0) {
      filtered = filtered.filter((int) => filterCategories.includes(int.category));
    }

    // Apply selected tab filter
    if (selectedCategory === 'popular') {
      filtered = filtered.filter((int) => int.popular);
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter((int) => int.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (int) =>
          int.name.toLowerCase().includes(query) ||
          int.description.toLowerCase().includes(query) ||
          int.category.toLowerCase().includes(query)
      );
    }

    // Apply max items limit
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [searchQuery, selectedCategory, filterCategories, maxItems]);

  // Get connection for an integration
  const getConnection = (integrationId: string): IntegrationConnection | undefined => {
    return connections.find((conn) => conn.integrationId === integrationId);
  };

  // Handle connect click
  const handleConnectClick = (integration: IntegrationDefinition) => {
    setSelectedIntegration(integration);
    if (integration.type === 'oauth') {
      setOauthDialogOpen(true);
    } else if (integration.type === 'api_key' || integration.type === 'webhook') {
      setApiKeyDialogOpen(true);
    }
  };

  // Handle OAuth connect
  const handleOAuthConnect = (integrationId: string) => {
    if (onConnect) {
      onConnect(integrationId);
    }
  };

  // Handle API Key connect
  const handleApiKeyConnect = (integrationId: string, credentials: Record<string, string>) => {
    if (onConnect) {
      onConnect(integrationId, credentials);
    }
  };

  // Count integrations per category
  const getCategoryCount = (category: IntegrationCategory | 'all' | 'popular'): number => {
    if (category === 'all') return INTEGRATIONS.length;
    if (category === 'popular') return INTEGRATIONS.filter((int) => int.popular).length;
    return INTEGRATIONS.filter((int) => int.category === category).length;
  };

  return (
    <Box>
      {/* Search and Filters */}
      {showSearch && (
        <Box sx={{ mb: spacing[24] }}>
          <TextField
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: text.tertiary }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ color: text.tertiary }}
                  >
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: typography.fontSize.sm,
              },
            }}
          />
        </Box>
      )}

      {/* Category Tabs */}
      {showTabs && !filterCategories && (
        <Box sx={{ mb: spacing[24], borderBottom: `1px solid ${alpha(color.neutral[900], 0.06)}` }}>
          <Tabs
            value={selectedCategory}
            onChange={(_, value) => setSelectedCategory(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                fontSize: typography.fontSize.sm,
                textTransform: 'none',
                fontWeight: typography.fontWeight.medium,
                color: text.secondary,
                px: spacing[16],
                '&.Mui-selected': {
                  color: color.functional.primary,
                },
              },
              '& .MuiTabs-indicator': {
                bgcolor: color.functional.primary,
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8] }}>
                  <span>All</span>
                  <Chip
                    label={getCategoryCount('all')}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      bgcolor: alpha(color.neutral[900], 0.06),
                      color: text.tertiary,
                    }}
                  />
                </Box>
              }
              value="all"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8] }}>
                  <span>Popular</span>
                  <Chip
                    label={getCategoryCount('popular')}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      bgcolor: alpha(color.ai[500], 0.1),
                      color: color.ai[700],
                    }}
                  />
                </Box>
              }
              value="popular"
            />
            {CATEGORIES.map((cat) => (
              <Tab
                key={cat.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[8] }}>
                    <span>{cat.label}</span>
                    <Chip
                      label={getCategoryCount(cat.id as IntegrationCategory)}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium,
                        bgcolor: alpha(color.neutral[900], 0.06),
                        color: text.tertiary,
                      }}
                    />
                  </Box>
                }
                value={cat.id}
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Integration Grid */}
      {filteredIntegrations.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[12] }}>
          {filteredIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              connection={getConnection(integration.id)}
              onConnect={handleConnectClick}
              onDisconnect={onDisconnect}
              onSettings={onSettings}
              compact={compact}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            py: spacing[64],
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: typography.fontSize.base,
              color: text.tertiary,
              mb: spacing[8],
            }}
          >
            No integrations found
          </Typography>
          <Typography
            sx={{
              fontSize: typography.fontSize.sm,
              color: text.tertiary,
            }}
          >
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}

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
