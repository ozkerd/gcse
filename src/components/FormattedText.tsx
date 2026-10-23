'use client';

import React from 'react';
import { KaTeXRenderer } from './KaTeXRenderer';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className = '',
}) => {
  if (!text) return null;
  // Normalize $$...$$ into $...$ for KaTeXRenderer compatibility
  const normalized = text.replace(/\$\$([^$]+)\$\$/g, '$$$1$$');
  return <KaTeXRenderer content={normalized} className={className} />;
};
