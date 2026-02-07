import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Copy, FileJson, AlignLeft, Save, AlignJustify, BookOpen, ChevronRight, Lightbulb, Terminal, HelpCircle, Undo2, Redo2, Search as SearchIcon, Command } from 'lucide-react';
import type { WorksheetContent } from '../types';

interface JSONEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: WorksheetContent) => void;
  initialValue?: WorksheetContent;
  confirmLabel?: string;
}

// ──────────────────────────────────────────────────
// Auto-close pairs for smart bracket matching
// ──────────────────────────────────────────────────
const BRACKET_PAIRS: Record<string, string> = {
  '{': '}',
  '[': ']',
  '"': '"',
};

const CLOSING_BRACKETS = new Set(['}', ']', '"']);

// ──────────────────────────────────────────────────
// Extract error line from JSON parse error
// ──────────────────────────────────────────────────
function getErrorLine(code: string, errorMsg: string): number | null {
  // Try to extract "position X" from error message
  const posMatch = errorMsg.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    const before = code.substring(0, pos);
    return before.split('\n').length;
  }
  // Try "line X column Y"
  const lineMatch = errorMsg.match(/line\s+(\d+)/i);
  if (lineMatch) {
    return parseInt(lineMatch[1], 10);
  }
  return null;
}

// ──────────────────────────────────────────────────
// Guide Components (kept minimal)
// ──────────────────────────────────────────────────
const GUIDE_MARKDOWN = `# Guide de Création des Fichiers JSON pour les Fiches d'Exercices

Ce guide a pour but de vous aider à formater correctement vos exercices dans un fichier JSON que l'application peut importer et afficher.

## 1. Vue d'ensemble de la Structure

Le fichier JSON doit contenir un objet principal avec deux clés obligatoires :

-   "chapter" (chaîne de caractères) : Le titre général de la fiche d'exercices.
-   "exercises" (tableau) : Une liste [...] de tous vos exercices.

## 2. Formules Mathématiques avec LaTeX

-   En ligne : Entourez la formule de dollars simples : $E = mc^2$
-   En bloc : Entourez la formule de dollars doubles : $$ \\sum_{i=1}^{n} i $$

**POINT CRUCIAL : L'échappement des backslashs**
En JSON, le caractère \\ est spécial. Vous devez le doubler pour écrire des commandes LaTeX.
-   Écrivez "\\\\sqrt" pour obtenir \\sqrt.
-   Écrivez "\\\\frac" pour obtenir \\frac.
`;

const CodeBlock = ({ code, label }: { code: string; label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-md overflow-hidden border border-slate-700 bg-slate-900">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700">
        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
          <Terminal className="w-3 h-3" />
          {label || 'JSON'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'OK' : 'Copier'}
        </button>
      </div>
      <div className="p-2.5 overflow-x-auto">
        <pre className="text-xs font-mono text-blue-100 leading-relaxed">{code}</pre>
      </div>
    </div>
  );
};

const GuideSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: React.ElementType }) => (
  <div className="mb-6">
    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2 pb-1.5 border-b border-slate-100">
      {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
      {title}
    </h3>
    <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
      {children}
    </div>
  </div>
);

const JSONGuide = ({ onClose }: { onClose: () => void }) => {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(GUIDE_MARKDOWN);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-sm font-bold font-display text-slate-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Guide
        </h2>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleCopyAll}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 rounded transition"
          >
            {copiedAll ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copiedAll ? "OK" : "Copier"}
          </button>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="max-w-none">
          <p className="text-slate-500 mb-4 bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-xs">
            Ce format JSON permet de structurer vos fiches d'exercices.
          </p>

          <GuideSection title="Structure de base" icon={FileJson}>
            <p>Deux cles obligatoires :</p>
            <ul className="list-disc pl-4 space-y-0.5 marker:text-indigo-400">
              <li><code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold text-[10px]">chapter</code> : Titre de la fiche</li>
              <li><code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-bold text-[10px]">exercises</code> : Liste d'exercices</li>
            </ul>
            <CodeBlock 
              label="Minimal"
              code={`{
  "chapter": "Algebre",
  "exercises": [{
    "id": "exo_1",
    "title": "Intro",
    "statement": "",
    "questions": [
      { "text": "$x+2=4$" }
    ]
  }]
}`} 
            />
          </GuideSection>

          <GuideSection title="Objets" icon={AlignJustify}>
            <p><strong>Exercice</strong> : id, title, statement, questions</p>
            <p><strong>Question</strong> : text, subquestions (optionnel)</p>
            <CodeBlock 
              label="Sous-questions"
              code={`{
  "text": "Etudier $f$.",
  "subquestions": [
    { "text": "Derivee" },
    { "text": "Variation" }
  ]
}`} 
            />
          </GuideSection>

          <GuideSection title="LaTeX" icon={Lightbulb}>
            <div className="bg-amber-50 border-l-3 border-amber-400 p-2.5 mb-3 rounded-r">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-amber-700 text-[10px]">
                  En JSON, doublez les backslashs : <code>\\sqrt</code> devient <code>\\\\sqrt</code>
                </p>
              </div>
            </div>
            <CodeBlock 
              label="Exemple"
              code={`"text": "$$\\\\int_0^1 x^2 dx$$"`} 
            />
          </GuideSection>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────
// Main Editor Component
// ──────────────────────────────────────────────────
const JSONEditorModal: React.FC<JSONEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  onImport, 
  initialValue,
  confirmLabel = "Appliquer"
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<{ message: string; line: number | null }>({ message: '', line: null });
  const [isValid, setIsValid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const content = initialValue || {
        chapter: "Nouveau Chapitre",
        exercises: [{
          id: "ex1",
          title: "Titre de l'exercice",
          statement: "",
          questions: [{ text: "Question 1" }]
        }]
      };
      const formatted = JSON.stringify(content, null, 2);
      setCode(formatted);
      setIsValid(true);
      setError({ message: '', line: null });
      setShowGuide(false);
      setSavedFlash(false);
      // Focus editor after open
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, initialValue]);

  // Scroll sync
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const validate = useCallback((value: string) => {
    try {
      const parsed = JSON.parse(value);
      
      if (!parsed.chapter || !Array.isArray(parsed.exercises)) {
        setError({ message: "Structure invalide : 'chapter' et 'exercises' requis.", line: null });
        setIsValid(false);
        return;
      }

      setError({ message: '', line: null });
      setIsValid(true);
    } catch (e: any) {
      let msg = e.message;
      const errorLine = getErrorLine(value, msg);
      if (msg.includes("Unexpected token") && value.includes("\\")) {
        msg += " -- Verifiez les backslashs LaTeX (doublez-les : \\\\)";
      }
      setError({ message: msg, line: errorLine });
      setIsValid(false);
    }
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    validate(val);
  };

  // ──────────────────────────────────────────────────
  // Smart keyboard handling
  // ──────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    
    // Ctrl+S / Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
      return;
    }

    // Ctrl+Shift+F to format
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      handleFormat();
      return;
    }

    // Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: Remove indent from current line
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const lineText = code.substring(lineStart, start);
        const spaces = lineText.match(/^ {1,2}/);
        if (spaces) {
          const newCode = code.substring(0, lineStart) + code.substring(lineStart + spaces[0].length);
          setCode(newCode);
          validate(newCode);
          setTimeout(() => {
            ta.selectionStart = ta.selectionEnd = start - spaces[0].length;
          }, 0);
        }
      } else {
        const newValue = code.substring(0, start) + "  " + code.substring(end);
        setCode(newValue);
        validate(newValue);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        }, 0);
      }
      return;
    }

    // Auto-close brackets and quotes
    if (BRACKET_PAIRS[e.key]) {
      const closing = BRACKET_PAIRS[e.key];
      
      // For quotes, skip if we're already before a quote (closing)
      if (e.key === '"' && code[start] === '"') {
        e.preventDefault();
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + 1;
        }, 0);
        return;
      }
      
      // If text is selected, wrap it
      if (start !== end) {
        e.preventDefault();
        const selected = code.substring(start, end);
        const newValue = code.substring(0, start) + e.key + selected + closing + code.substring(end);
        setCode(newValue);
        validate(newValue);
        setTimeout(() => {
          ta.selectionStart = start + 1;
          ta.selectionEnd = end + 1;
        }, 0);
        return;
      }
      
      // Auto-close
      e.preventDefault();
      let insertion = e.key + closing;
      
      // For { and [, add newline and indent if on empty line
      if ((e.key === '{' || e.key === '[') && (start === 0 || code[start - 1] === '\n' || code[start - 1] === ' ' || code[start - 1] === ':')) {
        // Just insert pair, keep cursor between
        const newValue = code.substring(0, start) + insertion + code.substring(end);
        setCode(newValue);
        validate(newValue);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + 1;
        }, 0);
        return;
      }

      const newValue = code.substring(0, start) + insertion + code.substring(end);
      setCode(newValue);
      validate(newValue);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // Skip over closing bracket if next char matches
    if (CLOSING_BRACKETS.has(e.key) && code[start] === e.key) {
      e.preventDefault();
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // Enter key: auto-indent
    if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const currentLine = code.substring(lineStart, start);
      const indent = currentLine.match(/^\s*/)?.[0] || '';
      
      // If previous char is { or [, add extra indent
      const prevChar = code[start - 1];
      const nextChar = code[start];
      
      if ((prevChar === '{' && nextChar === '}') || (prevChar === '[' && nextChar === ']')) {
        const newValue = code.substring(0, start) + '\n' + indent + '  ' + '\n' + indent + code.substring(start);
        setCode(newValue);
        validate(newValue);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + indent.length + 3;
        }, 0);
      } else if (prevChar === '{' || prevChar === '[') {
        const newValue = code.substring(0, start) + '\n' + indent + '  ' + code.substring(start);
        setCode(newValue);
        validate(newValue);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + indent.length + 3;
        }, 0);
      } else {
        const newValue = code.substring(0, start) + '\n' + indent + code.substring(end);
        setCode(newValue);
        validate(newValue);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + indent.length + 1;
        }, 0);
      }
      return;
    }

    // Backspace: delete matching pair
    if (e.key === 'Backspace' && start === end && start > 0) {
      const prev = code[start - 1];
      const next = code[start];
      if (BRACKET_PAIRS[prev] === next) {
        e.preventDefault();
        const newValue = code.substring(0, start - 1) + code.substring(start + 1);
        setCode(newValue);
        validate(newValue);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start - 1;
        }, 0);
        return;
      }
    }
  };

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(code);
      const formatted = JSON.stringify(parsed, null, 2);
      setCode(formatted);
      validate(formatted);
    } catch (_e) {
      // Can't format invalid JSON
    }
  }, [code, validate]);

  const handleMinify = useCallback(() => {
    try {
      const parsed = JSON.parse(code);
      const minified = JSON.stringify(parsed);
      setCode(minified);
      validate(minified);
    } catch (_e) {
      // Can't minify invalid JSON
    }
  }, [code, validate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = useCallback(() => {
    if (isValid) {
      onImport(JSON.parse(code));
      setSavedFlash(true);
      setTimeout(() => {
        setSavedFlash(false);
        onClose();
      }, 400);
    }
  }, [isValid, code, onImport, onClose]);

  // ──────────────────────────────────────────────────
  // Global keyboard shortcuts when modal is open
  // ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showGuide) {
          setShowGuide(false);
        } else {
          onClose();
        }
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose, showGuide]);

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 md:p-5">
      <div className={`bg-white border rounded-xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative transition-all duration-200 ${savedFlash ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-slate-200'}`}>
        
        {/* ─── Header ─── */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 font-display">Editeur JSON</h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`p-1.5 rounded-md transition-all text-xs ${
                showGuide 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              title="Guide (structure JSON)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative flex overflow-hidden">
          {/* ─── Editor Area ─── */}
          <div className="flex-1 flex flex-col min-w-0 transition-all duration-200">
            {/* Toolbar - minimal */}
            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50/80">
              <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-md p-0.5">
                <button 
                  onClick={handleFormat}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-50 text-slate-500 text-[11px] font-medium rounded transition"
                  title="Formater (Ctrl+Shift+F)"
                >
                  <AlignLeft className="w-3 h-3" />
                  Formater
                </button>
                <div className="w-px h-3 bg-slate-200" />
                <button 
                  onClick={handleMinify}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-50 text-slate-500 text-[11px] font-medium rounded transition"
                  title="Compacter"
                >
                  <AlignJustify className="w-3 h-3" />
                  Min
                </button>
              </div>

              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 text-slate-500 hover:text-slate-700 text-[11px] font-medium rounded hover:bg-white border border-transparent hover:border-slate-200 transition"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? "OK" : "Copier"}
              </button>
              
              <div className="flex-1" />

              {/* Keyboard shortcuts hint */}
              <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-0.5">
                  <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">Ctrl+S</kbd>
                  sauver
                </span>
                <span className="flex items-center gap-0.5">
                  <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">Ctrl+Shift+F</kbd>
                  formater
                </span>
              </div>

              <div className="w-px h-3 bg-slate-200 mx-1" />

              {isValid ? (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" />
                  Valide
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <AlertCircle className="w-3 h-3" />
                  Erreur{error.line ? ` L.${error.line}` : ''}
                </div>
              )}
            </div>

            {/* ─── Editor with Line Numbers ─── */}
            <div className="flex-1 relative flex overflow-hidden bg-slate-50">
              {/* Line numbers gutter */}
              <div 
                ref={lineNumbersRef}
                className="hidden md:flex flex-col w-10 pt-3 pr-2 font-mono text-[11px] text-right text-slate-400 bg-slate-100/80 border-r border-slate-200 select-none overflow-hidden leading-[1.65rem]"
                aria-hidden="true"
              >
                {lineNumbers.map((n) => (
                  <span 
                    key={n} 
                    className={`block px-1 ${error.line === n ? 'bg-rose-100 text-rose-600 font-bold' : ''}`}
                  >
                    {n}
                  </span>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                className="flex-1 w-full h-full p-3 bg-slate-50 text-slate-800 font-mono text-xs md:text-[13px] resize-none focus:outline-none focus:ring-0 leading-[1.65rem] tab-size-2"
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
              />
              
              {/* Error panel */}
              {!isValid && error.message && (
                <div className="absolute bottom-3 left-3 md:left-14 right-3 bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-lg shadow-lg flex items-start gap-2 text-[11px] font-mono z-10 max-h-24 overflow-y-auto">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-bold text-rose-700 text-[10px] uppercase tracking-wider mb-0.5">
                      Erreur{error.line ? ` - Ligne ${error.line}` : ''}
                    </p>
                    <p className="break-all">{error.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Sliding Guide Panel ─── */}
          <div 
            className={`absolute top-0 right-0 bottom-0 w-full md:w-[380px] bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-200 ease-out z-30 flex flex-col ${showGuide ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <JSONGuide onClose={() => setShowGuide(false)} />
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex justify-between items-center bg-white z-20">
          <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-3 font-mono">
            <span>{lineCount} lig.</span>
            <span>{code.length} car.</span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button 
              onClick={onClose}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md font-medium transition text-xs"
            >
              Fermer
            </button>
            <button 
              onClick={handleSave}
              disabled={!isValid}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-bold text-xs transition active:scale-95 ${
                savedFlash 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              {savedFlash ? 'Sauvegarde...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONEditorModal;
