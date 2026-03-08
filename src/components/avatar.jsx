export const getAvatarUrl = (user = {}) => {
    if (user.avatar) {
        try {
            const u = new URL(user.avatar);
            if (u.protocol === 'https:') return u.href;
        } catch {
        }
    }

    const seed = (user.restaurantName || user.email || 'Vendor')
        .trim()
        .slice(0, 64);

    const params = new URLSearchParams({
        seed,
        backgroundType: 'solid',
        backgroundColor: 'f97316',
        bold: 'true',
        fontSize: '40',
        chars: '2',
    });

    return `https://api.dicebear.com/7.x/initials/svg?${params.toString()}`;
};