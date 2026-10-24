'use client';

import React from 'react';
import { KaTeXRenderer } from './KaTeXRenderer';
import { formatVisualMathText } from '@/lib/math-format';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className = '',
}) => {
  if (!text) return null;
  const normalized = formatVisualMathText(text);
  return <KaTeXRenderer content={normalized} className={className} />;
};
