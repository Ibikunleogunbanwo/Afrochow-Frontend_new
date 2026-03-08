import React from 'react';
import { getAvatarUrl } from '@/components/avatar';

const sizeClasses = {
    small : 'w-8 h-8 text-xs',
    default: 'w-10 h-10 text-sm',
    large : 'w-12 h-12 text-base',
};

const AvatarDisplay = ({ user, size = 'default', className = '' }) => {
    const src = getAvatarUrl(user);

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={user?.name || 'User avatar'}
            className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
            loading="lazy"
            decoding="async"
        />
    );
};

export default AvatarDisplay;