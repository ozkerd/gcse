'use client';

import React from 'react';
import katex from 'katex';

interface Props {
  content: string;
  className?: string;
}

export const KaTeXRenderer: React.FC<Props> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split text by inline math delimiters $ ... $
  const parts = content.split(/(\$[^$]+\$)/g);

  return (
    <span className={`inline-block ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const math = part.slice(1, -1);
          try {
            const html = katex.renderToString(math, {
              throwOnError: false,
              displayMode: false,
            });
            return (
              <span
                key={index}
                className="inline-math mx-1 text-indigo-700 font-semibold"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch (e) {
            return <code key={index} className="bg-gray-100 px-1 rounded">{math}</code>;
          }
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
