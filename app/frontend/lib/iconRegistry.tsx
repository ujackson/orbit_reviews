import { SvgIconProps } from '@mui/material';
import {
  Business,
  Chat,
  Email,
  Group,
  HelpOutline,
  Instagram,
  RocketLaunch,
  Sms,
  WhatsApp,
} from '@mui/icons-material';
import { ComponentType } from 'react';

export type IconComponent = ComponentType<SvgIconProps>;

/**
 * Registry of available icon components mapped to string identifiers.
 * Used for dynamic icon resolution from server-provided data.
 */
const ICON_REGISTRY = {
  business: Business,
  chat: Chat,
  email: Email,
  group: Group,
  instagram: Instagram,
  rocket_launch: RocketLaunch,
  sms: Sms,
  whatsapp: WhatsApp,
} as const;

type IconName = keyof typeof ICON_REGISTRY;

/**
 * Normalizes icon name to match registry keys.
 * Converts to lowercase and replaces hyphens with underscores.
 */
export const normalizeIconName = (name: string): string => {
  return name.trim().toLowerCase().replace(/-/g, '_');
};

/**
 * Resolves a string identifier to its corresponding Material-UI icon component.
 * Returns HelpOutline as fallback for unknown icons.
 *
 * @param name - Icon identifier from server data
 * @returns Icon component ready to be rendered
 *
 * @example
 * const Icon = resolveIconComponent('business');
 * return <Icon fontSize="small" />;
 */
export const resolveIconComponent = (name: string): IconComponent => {
  const normalizedName = normalizeIconName(name) as IconName;
  return ICON_REGISTRY[normalizedName] || HelpOutline;
};
