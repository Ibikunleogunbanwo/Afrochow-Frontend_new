import { useEffect, useRef } from 'react';

/**
 * Hook to detect clicks outside of a component
 * @param {Function} handler - Callback function to execute on outside click
 * @param {boolean} enabled - Whether the hook is enabled
 * @returns {React.RefObject} - Ref to attach to the component
 */
export const useClickOutside = (handler, enabled = true) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                handler();
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handler, enabled]);

    return ref;
};

/**
 * Hook to handle keyboard navigation (Escape key)
 * @param {Function} onEscape - Callback function to execute on Escape key
 * @param {boolean} enabled - Whether the hook is enabled
 */
export const useKeyboardNav = (onEscape, enabled = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onEscape();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onEscape, enabled]);
};

/**
 * Combined hook for dropdown behavior (click outside + keyboard nav)
 * @param {Function} onClose - Callback function to close the dropdown
 * @param {boolean} isOpen - Whether the dropdown is open
 * @returns {React.RefObject} - Ref to attach to the dropdown
 */
export const useDropdown = (onClose, isOpen = false) => {
    const ref = useClickOutside(onClose, isOpen);
    useKeyboardNav(onClose, isOpen);
    return ref;
};