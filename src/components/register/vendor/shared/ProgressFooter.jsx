/**
 * Progress Footer Component
 * Shows encouraging progress message at bottom of forms
 */
export default function ProgressFooter({ message, emoji }) {
  if (!message) return null;

  return (
    <div className="pt-2 text-center">
      <p className="text-xs text-gray-500">
        {message} {emoji}
      </p>
    </div>
  );
}
