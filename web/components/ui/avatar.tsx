'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
};

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const initials = React.useMemo(() => {
    if (fallback) return fallback;
    if (alt) {
      return alt
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return null;
  }, [alt, fallback]);

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted',
        sizeClasses[size],
        className
      )}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : initials ? (
        <span className="font-medium text-muted-foreground">{initials}</span>
      ) : (
        <User className="h-1/2 w-1/2 text-muted-foreground" />
      )}
    </div>
  );
}

// Avatar Group
interface AvatarGroupProps {
  avatars: { src?: string; alt?: string; fallback?: string }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarGroup({ avatars, max = 4, size = 'md', className }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-background',
            sizeClasses[size]
          )}
        >
          <span className="font-medium text-muted-foreground">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}

// Avatar with Status
interface AvatarWithStatusProps extends AvatarProps {
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

export function AvatarWithStatus({ status, ...props }: AvatarWithStatusProps) {
  return (
    <div className="relative inline-block">
      <Avatar {...props} />
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}
