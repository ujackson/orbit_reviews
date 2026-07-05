import { Box, BoxProps, keyframes } from '@mui/material';
import { color, radius } from '../tokens/design-tokens';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

export type SkeletonVariant = 'text' | 'rectangular' | 'circular';

interface SkeletonLoaderProps extends Omit<BoxProps, 'component'> {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
}

export const SkeletonLoader = ({ 
  variant = 'text', 
  width = '100%', 
  height,
  sx = {},
  ...props 
}: SkeletonLoaderProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: '50%',
          height: height || width,
        };
      case 'rectangular':
        return {
          borderRadius: radius.base,
          height: height || 48,
        };
      case 'text':
      default:
        return {
          borderRadius: radius.sm,
          height: height || '1em',
          transform: 'scale(1, 0.6)',
        };
    }
  };

  return (
    <Box
      sx={{
        width,
        background: `linear-gradient(90deg, ${color.neutral[100]} 0%, ${color.neutral[200]} 50%, ${color.neutral[100]} 100%)`,
        backgroundSize: '200% 100%',
        animation: `${shimmer} 2s ease-in-out infinite`,
        ...getVariantStyles(),
        ...sx,
      }}
      {...props}
    />
  );
};
