import React from 'react';
import { ArrowLeft, Printer, Sliders } from 'lucide-react';

interface WorksheetHeaderProps {
  worksheetName: string;
  onBack: () => void;
  onOpenSettings: () => void;
}

const WorksheetHeader: React.FC<WorksheetHeaderProps> = ({ worksheetName, onBack, onOpenSettings }) => {
  
  const handlePrint = () => {
    const originalTitle = document.title;
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR').replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    const safeName = worksheetName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    document.title = `${safeName}_${dateStr}_${timeStr}`;
    window.print();
    
    // Restore original title after a short delay to ensure print dialog captures it
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-20 no-print print:hidden">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-blue-600 rounded-none hover:bg-blue-50 transition shrink-0"
            aria-label="Retour au dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-px h-6 bg-slate-300 shrink-0 mx-1" />
          <h1 className="text-base md:text-lg font-semibold font-display text-slate-900 truncate" title={worksheetName}>
            {worksheetName}
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 bg-white border border-slate-300 hover:border-blue-600 rounded-none transition shadow-sm"
            aria-label="Paramètres"
            title="Paramètres de la fiche"
          >
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-none transition shadow-sm"
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