/**
 * Form Section Wrapper
 * Groups related form fields with optional title
 */
export default function FormSection({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`space-y-5 ${className}`}>
      {title && (
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-gray-400" />}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}
