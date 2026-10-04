import Link from "next/link";

// Renders the small inline markup used in backend content documents:
// **bold** and [label](href). Everything else is plain text.
const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export default function RichText({ text, linkClassName = "text-emerald-600 hover:underline", boldClassName = "text-slate-800" }) {
    if (!text) return null;

    const parts = [];
    let last = 0;
    for (const match of text.matchAll(TOKEN)) {
        if (match.index > last) parts.push(text.slice(last, match.index));
        const [, bold, label, href] = match;
        const key = match.index;
        if (bold) {
            parts.push(<strong key={key} className={boldClassName}>{bold}</strong>);
        } else if (href.startsWith("/")) {
            parts.push(<Link key={key} href={href} className={linkClassName}>{label}</Link>);
        } else if (href.startsWith("mailto:")) {
            parts.push(<a key={key} href={href} className={linkClassName}>{label}</a>);
        } else {
            parts.push(<a key={key} href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>{label}</a>);
        }
        last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return <>{parts}</>;
}
