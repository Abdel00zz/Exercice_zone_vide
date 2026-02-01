import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Copy, FileJson, AlignLeft, Save, AlignJustify, BookOpen, ChevronRight, Lightbulb, Terminal, HelpCircle } from 'lucide-react';
import type { WorksheetContent } from '../types';

interface JSONEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: WorksheetContent) => void;
  initialValue?: WorksheetContent;
  confirmLabel?: string;
}

const GUIDE_MARKDOWN = `# Guide de Création des Fichiers JSON pour les Fiches d'Exercices

Ce guide a pour but de vous aider à formater correctement vos exercices dans un fichier JSON que l'application peut importer et afficher.

## 1. Vue d'ensemble de la Structure

Le fichier JSON doit contenir un objet principal avec deux clés obligatoires :

-   "chapter" (chaîne de caractères) : Le titre général de la fiche d'exercices.
-   "exercises" (tableau) : Une liste [...] de tous vos exercices.

Exemple de base :
\`\`\`json
{
  "chapter": "Algèbre de base",
  "exercises": [
    {
      "id": "exo_algebre_1",
      "title": "Introduction à l'algèbre",
      "statement": "Résolvez les équations suivantes :",
      "questions": [
        { "text": "Quelle est la valeur de $x$ dans l'équation $x + 5 = 10$ ?" }
      ]
    }
  ]
}
\`\`\`

## 2. Détail de la Structure

### L'Objet Exercice
Chaque exercice nécessite :
-   "id" : Un identifiant unique (ex: "exo_1").
-   "title" : Le titre de l'exercice.
-   "statement" : L'énoncé général (peut être vide "").
-   "questions" : Une liste de questions.

### L'Objet Question
Chaque question contient :
-   "text" : Le texte de la question.
-   "subquestions" : (Optionnel) Tableau de sous-questions.

## 3. Formules Mathématiques avec LaTeX

-   En ligne : Entourez la formule de dollars simples : $E = mc^2$
-   En bloc : Entourez la formule de dollars doubles : $$ \\sum_{i=1}^{n} i $$

⚠️ **POINT CRUCIAL : L'échappement des backslashs**
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
    <div className="my-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-sm group">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
          <Terminal className="w-3 h-3" />
          {label || 'JSON'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
        >
          {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
      <div className="p-3 overflow-x-auto custom-scrollbar">
        <pre className="text-xs md:text-sm font-mono text-blue-100 leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
};

const GuideSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: React.ElementType }) => (
  <div className="mb-8">
    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100">
      {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
      {title}
    </h3>
    <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
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
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Guide de Structure
        </h2>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 rounded-md transition shadow-sm"
                title="Copier tout le contenu du guide (Markdown)"
            >
                {copiedAll ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAll ? "Copié" : "Copier le guide"}
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition">
            <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="prose prose-sm prose-slate max-w-none">
          <p className="text-slate-500 mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-sm">
            Ce format JSON permet de structurer vos fiches d'exercices. Suivez ce modèle pour garantir une importation correcte.
          </p>

          <GuideSection title="Structure de base" icon={FileJson}>
            <p>Le fichier doit contenir un objet principal avec deux clés obligatoires :</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-indigo-400">
              <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold">chapter</code> : Le titre de la fiche.</li>
              <li><code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold">exercises</code> : Une liste de vos exercices.</li>
            </ul>
            <CodeBlock 
              label="Exemple Minimal"
              code={`{
  "chapter": "Algèbre de base",
  "exercises": [
    {
      "id": "exo_1",
      "title": "Introduction",
      "statement": "Résolvez :",
      "questions": [
        { "text": "Trouver $x$ si $x+2=4$" }
      ]
    }
  ]
}`} 
            />
          </GuideSection>

          <GuideSection title="Détails des Objets" icon={AlignJustify}>
            <h4 className="font-bold text-slate-700 mt-4 mb-2">L'Objet Exercice</h4>
            <p>Chaque exercice nécessite :</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-indigo-400">
              <li><strong>id</strong> : Identifiant unique (ex: "exo_1").</li>
              <li><strong>title</strong> : Titre affiché.</li>
              <li><strong>statement</strong> : Énoncé (peut être vide).</li>
              <li><strong>questions</strong> : Tableau de questions.</li>
            </ul>

            <h4 className="font-bold text-slate-700 mt-4 mb-2">L'Objet Question</h4>
            <p>Une question contient le texte et optionnellement des sous-questions.</p>
            <CodeBlock 
              label="Questions Imbriquées"
              code={`{
  "text": "Étudiez la fonction $f$.",
  "subquestions": [
    { "text": "Dérivée $f'(x)$." },
    { "text": "Tableau de variation." }
  ]
}`} 
            />
          </GuideSection>

          <GuideSection title="Mathématiques & LaTeX" icon={Lightbulb}>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-800 text-sm">Point Crucial : Les Backslashs</h4>
                  <p className="text-amber-700 text-xs mt-1">
                    En JSON, le caractère <code>\</code> est spécial. Pour écrire une commande LaTeX comme <code>\sqrt</code>, vous devez doubler le backslash : <code>\\sqrt</code>.
                  </p>
                </div>
              </div>
            </div>
            <ul className="list-disc pl-5 space-y-1 marker:text-amber-400">
              <li>En ligne : <code>$E = mc^2$</code></li>
              <li>En bloc : <code>{'$$ \\sum_{i=0}^n i $$'}</code></li>
            </ul>
            <CodeBlock 
              label="Exemple LaTeX Correct"
              code={`"text": "Calculer $$\\int_0^1 x^2 dx$$ et $\\sqrt{2}$"`} 
            />
          </GuideSection>
        </div>
      </div>
    </div>
  );
};

const JSONEditorModal: React.FC<JSONEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  onImport, 
  initialValue,
  confirmLabel = "Appliquer les changements"
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<{ message: string; type: 'json' | 'latex' | null }>({ message: '', type: null });
  const [isValid, setIsValid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const content = initialValue || {
        chapter: "Nouveau Chapitre",
        exercises: [{
          id: "ex1",
          title: "Titre de l'exercice",
          statement: "Énoncé avec LaTeX : $\\sqrt{x^2} = |x|$",
          questions: [{ text: "Question 1" }]
        }]
      };
      setCode(JSON.stringify(content, null, 2));
      setIsValid(true);
      setShowGuide(false);
    }
  }, [isOpen, initialValue]);

  // Synchronisation du scroll
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const validate = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      
      if (!parsed.chapter || !Array.isArray(parsed.exercises)) {
        setError({ message: "Structure invalide : Les clés 'chapter' (texte) et 'exercises' (tableau) sont requises.", type: 'json' });
        setIsValid(false);
        return;
      }

      setError({ message: '', type: null });
      setIsValid(true);
    } catch (e: any) {
      let msg = e.message;
      if (msg.includes("Unexpected token") && value.includes("\\")) {
         msg += " (Vérifiez vos formules LaTeX : les backslashs '\\' doivent être doublés '\\\\' dans le code JSON).";
      }
      setError({ message: msg, type: 'json' });
      setIsValid(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    validate(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = code.substring(0, start) + "  " + code.substring(end);
      setCode(newValue);
      validate(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(code);
      const formatted = JSON.stringify(parsed, null, 2);
      setCode(formatted);
      validate(formatted);
    } catch (e) {
    }
  };

  const handleMinify = () => {
    try {
        const parsed = JSON.parse(code);
        const minified = JSON.stringify(parsed);
        setCode(minified);
        validate(minified);
    } catch (e) {
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (isValid) {
      onImport(JSON.parse(code));
      onClose();
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 md:p-6 transition-all">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-6xl h-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-black/5 relative">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white z-20 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display tracking-wide">Éditeur Source JSON</h2>
              <p className="text-xs text-slate-500 font-sans">Modifiez la structure brute de la fiche</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button
                onClick={() => setShowGuide(!showGuide)}
                className={`p-2 rounded-full transition-all ${
                  showGuide 
                    ? 'bg-indigo-100 text-indigo-700 shadow-inner' 
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                }`}
                title="Afficher le guide de création"
             >
                <HelpCircle className="w-5 h-5" />
             </button>
             <div className="h-6 w-px bg-slate-200 mx-1"></div>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative flex overflow-hidden">
          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
            {/* Toolbar */}
            <div className="px-4 py-2 border-b border-slate-200 flex flex-wrap items-center gap-2 bg-slate-50">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5 shadow-sm">
                <button 
                    onClick={handleFormat}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded transition"
                    title="Formater le code (Prettify)"
                >
                    <AlignLeft className="w-3.5 h-3.5" />
                    Formater
                </button>
                <div className="w-[1px] h-4 bg-slate-200"></div>
                <button 
                    onClick={handleMinify}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded transition"
                    title="Compacter le code (Minify)"
                >
                    <AlignJustify className="w-3.5 h-3.5" />
                    Compacter
                </button>
              </div>

              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium rounded border border-slate-200 shadow-sm transition ml-2"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copié !" : "Copier"}
              </button>
              
              <div className="flex-1"></div>

              {isValid ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  JSON Valide
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Erreur de Syntaxe
                </div>
              )}
            </div>

            {/* Editor with Line Numbers */}
            <div className="flex-1 relative flex overflow-hidden bg-slate-50">
              <div 
                ref={lineNumbersRef}
                className="hidden md:block w-12 pt-4 px-2 text-right font-mono text-xs text-slate-400 bg-slate-100 border-r border-slate-200 select-none overflow-hidden leading-6"
                aria-hidden="true"
              >
                {lineNumbers}
              </div>

              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                className="flex-1 w-full h-full p-4 bg-slate-50 text-slate-800 font-mono text-xs md:text-sm resize-none focus:outline-none focus:ring-0 leading-6 tab-size-2"
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
              />
              
              {!isValid && error.message && (
                <div className="absolute bottom-4 left-4 md:left-16 right-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 text-xs font-mono animate-in fade-in slide-in-from-bottom-2 z-10">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1 text-rose-700">Erreur détectée</p>
                    {error.message}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sliding Guide Panel */}
          <div 
            className={`absolute top-0 right-0 bottom-0 w-full md:w-[500px] bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out z-30 flex flex-col ${showGuide ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <JSONGuide onClose={() => setShowGuide(false)} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-white z-20">
          <div className="text-xs text-slate-500 hidden md:block font-medium">
            {lineCount} lignes &bull; {code.length} caractères
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition text-sm"
            >
              Fermer
            </button>
            <button 
              onClick={handleSave}
              disabled={!isValid}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-indigo-100 active:scale-95"
            >
              <Save className="w-4 h-4" />
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONEditorModal;