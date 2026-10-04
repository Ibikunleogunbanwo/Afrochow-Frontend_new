import Link from "next/link";
import { Mail } from "lucide-react";
import RichText from "./RichText";
import ContentUnavailable from "./ContentUnavailable";

const Section = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">{title}</h2>
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">{children}</div>
    </section>
);

const COOKIE_TYPE_STYLES = {
    Essential: "bg-blue-50 text-blue-700",
    Functional: "bg-green-50 text-green-700",
};

const Table = ({ columns, rows }) => {
    const typeColumn = columns.indexOf("Type");
    return (
        <div className="overflow-x-auto -mx-1">
            <table className="w-full text-left mt-2">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        {columns.map((col) => (
                            <th key={col} className="py-2.5 pr-4 text-xs font-semibold text-slate-700">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row[0]} className="border-b border-slate-100 last:border-0">
                            {row.map((cell, i) => (
                                <td key={i} className={`py-2.5 pr-4 text-xs align-top ${i === 0 ? "font-medium text-slate-800" : "text-slate-600"}`}>
                                    {i === typeColumn ? (
                                        <span className={`px-2 py-0.5 rounded-full font-medium ${COOKIE_TYPE_STYLES[cell] ?? "bg-emerald-50 text-emerald-700"}`}>
                                            {cell}
                                        </span>
                                    ) : cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Block = ({ block }) => {
    switch (block.type) {
        case "paragraph":
            return <p><RichText text={block.text} /></p>;
        case "list":
            return (
                <ul className="list-disc list-inside space-y-1 pl-2">
                    {block.items.map((item) => <li key={item}><RichText text={item} /></li>)}
                </ul>
            );
        case "table":
            return <Table columns={block.columns} rows={block.rows} />;
        case "contact":
            return (
                <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                    <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-slate-800 text-sm">{block.label}</p>
                        <a href={`mailto:${block.email}`} className="text-emerald-600 hover:underline text-sm">{block.email}</a>
                    </div>
                </div>
            );
        default:
            return null;
    }
};

/**
 * Renders a backend PolicyDocument (privacy, terms, cookies).
 * `fallbackTitle` is used in the hero if the document failed to load.
 */
export default function PolicyPage({ doc, icon: Icon, fallbackTitle, relatedLinks = [] }) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-emerald-500 to-amber-600 text-white py-14 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{doc?.title ?? fallbackTitle}</h1>
                    {doc?.lastUpdated && <p className="text-emerald-100 text-sm">Last updated: {doc.lastUpdated}</p>}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-12">
                {doc ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <p className="text-slate-600 text-sm leading-relaxed mb-8">
                            <RichText text={doc.intro} />
                        </p>

                        {doc.sections.map((section) => (
                            <Section key={section.id} title={section.heading}>
                                {section.blocks.map((block, i) => <Block key={i} block={block} />)}
                            </Section>
                        ))}

                        {relatedLinks.length > 0 && (
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                                {relatedLinks.map(({ href, label }) => (
                                    <Link key={href} href={href} className="text-sm text-emerald-600 hover:underline font-medium">{label} →</Link>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <ContentUnavailable what={fallbackTitle} />
                )}
            </div>
        </div>
    );
}
