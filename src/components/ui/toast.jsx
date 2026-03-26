'use client';

import { motion } from 'framer-motion';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Variant config ───────────────────────────────────────────────────────────

const variantStyles = {
  default: 'bg-white border-gray-200',
  success: 'bg-white border-green-500/60',
  error:   'bg-white border-red-500/60',
  warning: 'bg-white border-amber-500/60',
};

const titleColors = {
  default: 'text-gray-900',
  success: 'text-green-600',
  error:   'text-red-600',
  warning: 'text-amber-600',
};

const iconColors = {
  default: 'text-gray-400',
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
};

const variantIcons = {
  default: Info,
  success: CheckCircle,
  error:   AlertCircle,
  warning: AlertTriangle,
};

// ─── Animation ────────────────────────────────────────────────────────────────

const toastAnimation = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: { opacity: 1, y: 0,  scale: 1    },
  exit:    { opacity: 0, y: 16, scale: 0.96 },
};

// ─── Toast content (rendered inside sonner's custom slot) ─────────────────────

function ToastContent({ toastId, title, message, variant = 'default', action, onDismiss }) {
  const Icon = variantIcons[variant];

  return (
    <motion.div
      variants={toastAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn(
        'flex items-center justify-between w-full max-w-sm p-3 rounded-xl border shadow-lg',
        variantStyles[variant]
      )}
    >
      {/* Left: icon + text */}
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', iconColors[variant])} />
        <div className="space-y-0.5 min-w-0">
          {title && (
            <p className={cn('text-xs font-semibold leading-tight', titleColors[variant])}>
              {title}
            </p>
          )}
          {message && (
            <p className="text-xs text-gray-500 leading-snug">{message}</p>
          )}
        </div>
      </div>

      {/* Right: optional action button + dismiss */}
      <div className="flex items-center gap-1.5 ml-3 shrink-0">
        {action?.label && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              sonnerToast.dismiss(toastId);
            }}
            className={cn(
              'text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors',
              variant === 'success' && 'text-green-600 border-green-300 hover:bg-green-50',
              variant === 'error'   && 'text-red-600   border-red-300   hover:bg-red-50',
              variant === 'warning' && 'text-amber-600 border-amber-300 hover:bg-amber-50',
              variant === 'default' && 'text-gray-700  border-gray-200  hover:bg-gray-50',
            )}
          >
            {action.label}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            sonnerToast.dismiss(toastId);
            onDismiss?.();
          }}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-3 w-3 text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Toaster (place once in layout) ──────────────────────────────────────────

export function Toaster({ position = 'bottom-right' }) {
  return (
    <SonnerToaster
      position={position}
      toastOptions={{
        unstyled: true,
        className: 'flex w-full justify-end',
      }}
    />
  );
}

// ─── Internal show helper ─────────────────────────────────────────────────────
// Normalises both call signatures used across the codebase:
//   toast.success("Title")
//   toast.success("Title", { description: "...", id, duration, action, onDismiss })

function show(variant, titleOrMessage, options = {}) {
  const {
    description,
    id,
    duration = 4000,
    position,
    onDismiss,
    action,
  } = typeof options === 'object' ? options : {};

  return sonnerToast.custom(
    (toastId) => (
      <ToastContent
        toastId={toastId}
        title={titleOrMessage}
        message={description ?? null}
        variant={variant}
        action={action}
        onDismiss={onDismiss}
      />
    ),
    { id, duration, position }
  );
}

// ─── Drop-in replacement for `import { toast } from 'sonner'` ────────────────

export const toast = {
  success: (msg, opts) => show('success', msg, opts),
  error:   (msg, opts) => show('error',   msg, opts),
  warning: (msg, opts) => show('warning', msg, opts),
  info:    (msg, opts) => show('default', msg, opts),
  default: (msg, opts) => show('default', msg, opts),
  dismiss: (...args)   => sonnerToast.dismiss(...args),
  promise: (...args)   => sonnerToast.promise(...args),
};
