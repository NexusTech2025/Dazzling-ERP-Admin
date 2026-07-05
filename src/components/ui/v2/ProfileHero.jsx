import React, { useState } from 'react';

/**
 * ProfileHero component for displaying identity information, status, and actions on mobile.
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.avatar - Avatar component node.
 * @param {string} props.title - Profile entity name or title.
 * @param {React.ReactNode} props.badge - Status badge component node.
 * @param {string} props.idText - Unique profile identifier text.
 * @param {Array<Object>} props.metaLines - Array of objects with format { text: string, icon?: string } representing description lines.
 * @param {React.ReactNode} [props.actions] - Action buttons stack node on the right.
 * @returns {React.ReactElement} Redesigned profile header element.
 */
export default function ProfileHero({ avatar, title, badge, idText, metaLines, actions }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!idText) return;
    const cleanId = idText.replace(/^ID:\s*/i, '');
    navigator.clipboard.writeText(cleanId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        {/* Avatar Area */}
        <div className="shrink-0">
          {avatar}
        </div>

        {/* Info Grid */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
              {title}
            </h2>
            {badge}
          </div>

          {/* ID Clipboard Copy Button */}
          {idText && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors font-medium select-none"
            >
              <span>{idText}</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>
          )}

          {/* Metadata Lines */}
          {metaLines && metaLines.length > 0 && (
            <div className="space-y-1 pt-1">
              {metaLines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {line.icon && (
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      {line.icon}
                    </span>
                  )}
                  <span className="truncate">{line.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action triggers */}
      {actions && (
        <div className="shrink-0 w-full md:w-auto flex md:flex-col gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
