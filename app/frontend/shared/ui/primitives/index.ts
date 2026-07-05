/**
 * Primitive Components (Layer 1)
 * 
 * Design system atoms with:
 * ✅ Styling
 * ✅ Accessibility
 * ✅ Visual states (default, hover, active, focus, disabled)
 * 
 * Must NOT contain:
 * ❌ Business logic
 * ❌ Data fetching
 * ❌ Feature-specific knowledge
 */

export { Avatar } from './Avatar';
export type { AvatarSize } from './Avatar';

export { Button } from './Button';
export type { ButtonVariant, ButtonSize } from './Button';

export { IconButton } from './IconButton';
export type { IconButtonVariant, IconButtonSize } from './IconButton';

export { Chip } from './Chip';
export type { ChipVariant, ChipSize } from './Chip';

export { CardSurface } from './CardSurface';
export type { CardSurfaceVariant, CardSurfaceLevel } from './CardSurface';

export { InputField } from './InputField';
export type { InputFieldSize } from './InputField';

export { SkeletonLoader } from './SkeletonLoader';
export type { SkeletonVariant } from './SkeletonLoader';

export { AiBadge } from './AiBadge';
