import React from 'react';
import { ArrowLeft, Printer, Sliders } from 'lucide-react';

interface WorksheetHeaderProps {
  worksheetName: string;
  onBack: () => void;
  onOpenSettings: () => void;
}

const WorksheetHeader: React.FC<WorksheetHeaderProps> = ({ worksheetName, onBack, onOpenSettings }) => {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-3 sticky top-0 z-20 no-print print:hidden">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition shrink-0"
            aria-label="Retour au dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-px h-6 bg-slate-200 shrink-0 mx-1" />
          <h1 className="text-sm font-bold font-display text-slate-800 truncate" title={worksheetName}>
            {worksheetName}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 rounded-lg transition shadow-sm"
            aria-label="Paramètres"
            title="Paramètres de la fiche"
          >
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-sm"
            aria-label="Imprimer la fiche"
            title="Imprimer (Ctrl+P)"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default WorksheetHeader;