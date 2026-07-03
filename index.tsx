import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { MathJaxContext } from 'better-react-mathjax';

// 🔧 IMPORTANT : Import du fichier CSS pour l'impression
import './index.css';
import './styles/print.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const config = {
  startup: { typeset: true },
  options: { enableMenu: false, renderActions: { addMenu: [] } },
  loader: { load: ["input/tex", "output/svg", "[tex]/ams", "[tex]/mathtools"] },
  tex: {
    packages: { '[+]': ['ams', 'mathtools'] },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
  },
  svg: {
    fontCache: 'global',
    mtextInheritFont: true,
    merrorInheritFont: true,
    internalSpeechTitles: false,
  },
};

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MathJaxContext config={config}>
      <App />
    </MathJaxContext>
  </React.StrictMode>
);