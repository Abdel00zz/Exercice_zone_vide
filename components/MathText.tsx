import React, { useMemo } from 'react';
import { MathJax } from 'better-react-mathjax';

interface MathTextProps {
  text: string;
}

const normalizeMathText = (value: string): string => value
  .replace(/\r\n?/g, '\n')
  .replace(/\\\[/g, '\\\[')
  .replace(/\\\]/g, '\\\]')
  .trim();

const MathText: React.FC<MathTextProps> = React.memo(({ text }) => {
  const normalizedText = useMemo(() => normalizeMathText(text || ''), [text]);

  return (
    <MathJax inline dynamic hideUntilTypeset="first">
      <span className="math-text">{normalizedText}</span>
    </MathJax>
  );
});

MathText.displayName = 'MathText';

export default MathText;
