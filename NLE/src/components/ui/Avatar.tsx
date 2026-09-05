import { useEffect, useState } from 'react';
import type { AuthUser } from '../../types';
import { getAvatarColor, getAvatarIdentifier, getAvatarInitial } from '../../utils/avatar';
import { cn } from '../../utils/utils';

interface AvatarProps {
  user: AuthUser | null | undefined;
  className?: string;
  alt?: string;
}

export default function Avatar({ user, className = '', alt }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSource = (user?.avatar?.trim() || user?.photoURL?.trim() || '').trim();

  useEffect(() => {
    setImageFailed(false);
  }, [imageSource]);

  const shouldRenderImage = Boolean(imageSource) && !imageFailed;

  if (shouldRenderImage) {
    return (
      <img
        src={imageSource}
        alt={alt || user?.name || user?.email || 'User avatar'}
        onError={() => setImageFailed(true)}
        className={cn('rounded-full object-cover', className)}
      />
    );
  }

  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-full text-[#FFF3E6] text-xs font-semibold',
        getAvatarColor(getAvatarIdentifier(user)),
        className
      )}
      aria-hidden="true"
    >
      {getAvatarInitial(user)}
    </span>
  );
}
