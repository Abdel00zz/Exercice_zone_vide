import React, { useRef, useState, useMemo } from 'react';
import type { Worksheet, WorksheetContent } from '../types';
import { FileUp, Trash2, Pencil, Search, Code, Calendar, ChevronRight, FileText, Plus } from 'lucide-react';
import JSONEditorModal from './JSONEditorModal';

interface DashboardProps {
    worksheets: Worksheet[];
    onSelectWorksheet: (id: string) => void;
    onAddWorksheet: (worksheet: Worksheet) => void;
    onDeleteWorksheet: (id: string) => void;
    onRenameWorksheet: (id: string, newName: string) => void;
    onUpdateWorksheet: (id: string, content: WorksheetContent) => void;
    setImportError: (error: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    worksheets,
    onSelectWorksheet,
    onAddWorksheet,
    onDeleteWorksheet,
    onRenameWorksheet,
    onUpdateWorksheet,
    setImportError
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
    const [jsonMode, setJsonMode] = useState<'create' | 'edit'>('create');
    const [editingWorksheet, setEditingWorksheet] = useState<Worksheet | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImportError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('Le fichier ne peut pas etre lu.');
                }
                const jsonData = JSON.parse(text) as WorksheetContent;
                processImport(jsonData, file.name);
            } catch (error) {
                console.error("Erreur d'importation JSON:", error);
                setImportError(error instanceof Error ? error.message : 'Fichier JSON invalide.');
            }
        };
        reader.onerror = () => {
            setImportError('Erreur de lecture du fichier.');
        }
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const processImport = (jsonData: WorksheetContent, fallbackName: string = 'Nouvelle Fiche') => {
        if (!jsonData.chapter || typeof jsonData.chapter !== 'string' || !jsonData.exercises || !Array.isArray(jsonData.exercises)) {
            throw new Error('Le JSON est invalide. Il doit contenir une cle "chapter" (texte) et une cle "exercises" (tableau).');
        }
        
        const newWorksheet: Worksheet = {
            id: `ws_${Date.now()}`,
            name: jsonData.chapter || fallbackName.replace('.json', '') || 'Nouvelle Fiche',
            createdAt: new Date().toISOString(),
            content: jsonData,
        };
        onAddWorksheet(newWorksheet);
    };

    const handleRename = (worksheet: Worksheet) => {
        setRenamingId(worksheet.id);
        setNewName(worksheet.name);
    }

    const handleSaveRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (renamingId && newName.trim()) {
            onRenameWorksheet(renamingId, newName.trim());
            setRenamingId(null);
            setNewName('');
        }
    }

    const handleOpenCreateJson = () => {
        setJsonMode('create');
        setEditingWorksheet(null);
        setIsJsonModalOpen(true);
    };

    const handleEditJson = (worksheet: Worksheet) => {
        setJsonMode('edit');
        setEditingWorksheet(worksheet);
        setIsJsonModalOpen(true);
    };

    const handleJsonSave = (content: WorksheetContent) => {
        if (jsonMode === 'create') {
            processImport(content);
        } else if (jsonMode === 'edit' && editingWorksheet) {
            onUpdateWorksheet(editingWorksheet.id, content);
            if (content.chapter && content.chapter !== editingWorksheet.name) {
                onRenameWorksheet(editingWorksheet.id, content.chapter);
            }
        }
    };

    const filteredWorksheets = useMemo(() => {
        if (!searchQuery) {
            return worksheets;
        }
        return worksheets.filter(ws => 
            ws.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [worksheets, searchQuery]);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-12 md:px-10">

            {/* ── Header ── */}
            <header className="mb-12 border-b border-slate-200 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-semibold font-display text-slate-900 tracking-tight">Mes Fiches d'Exercices</h1>
                        <p className="text-slate-500 mt-2 text-base">{worksheets.length} fiche{worksheets.length !== 1 ? 's' : ''} disponible{worksheets.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <Search className="h-5 w-5 text-slate-400 absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-none border border-slate-300 bg-white text-base focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition placeholder:text-slate-400 outline-none"
                                aria-label="Rechercher une fiche par nom"
                            />
                        </div>
                        
                        <button
                            onClick={handleOpenCreateJson}
                            className="p-2.5 border border-slate-300 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-600 rounded-none transition shrink-0"
                            title="Editeur JSON"
                            aria-label="Editeur JSON"
                        >
                            <Code className="h-5 w-5" />
                        </button>

                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="hidden"
                            ref={fileInputRef}
                            id="json-importer"
                        />
                        <label
                            htmlFor="json-importer"
                            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-none cursor-pointer transition shrink-0 text-base gap-2 shadow-sm"
                        >
                            <FileUp className="h-5 w-5" />
                            <span>Importer JSON</span>
                        </label>
                    </div>
                </div>
            </header>
            
            {/* ── Cards grid ── */}
            {filteredWorksheets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorksheets.map((ws) => {
                        const classNameLabel = ws.content?.settings?.className?.trim() || '';
                        const exerciseCount = ws.content?.exercises?.length || 0;

                        return (
                            <div 
                                key={ws.id} 
                                className="group bg-white rounded-none border border-slate-300 hover:border-blue-600 flex flex-col transition-all duration-200 hover:shadow-lg cursor-pointer min-h-[200px]"
                                onClick={() => onSelectWorksheet(ws.id)}
                                onDoubleClick={(e) => { e.stopPropagation(); handleEditJson(ws); }}
                                title="Cliquez pour ouvrir"
                            >
                               <div className="p-6 flex-1 flex flex-col">
                                   {/* Title + actions row */}
                                   <div className="flex items-start justify-between gap-3 mb-4">
                                       {renamingId === ws.id ? (
                                           <form onSubmit={handleSaveRename} onClick={(e) => e.stopPropagation()} className="flex-1">
                                               <input 
                                                   type="text"
                                                   value={newName}
                                                   onChange={(e) => setNewName(e.target.value)}
                                                   onBlur={handleSaveRename}
                                                   autoFocus
                                                   className="text-lg font-semibold font-display text-slate-900 w-full border-b-2 border-blue-600 focus:outline-none bg-transparent pb-1"
                                               />
                                           </form>
                                       ) : (
                                           <h2 className="text-lg font-semibold font-display text-slate-900 leading-snug line-clamp-2 flex-1 group-hover:text-blue-700 transition-colors">
                                               {ws.name}
                                           </h2>
                                       )}

                                       {/* Hover actions */}
                                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                                           <button 
                                               onClick={() => handleRename(ws)} 
                                               className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" 
                                               aria-label="Renommer"
                                           >
                                               <Pencil className="h-4 w-4" />
                                           </button>
                                           <button 
                                               onClick={() => handleEditJson(ws)} 
                                               className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" 
                                               aria-label="Editer JSON"
                                           >
                                               <Code className="h-4 w-4" />
                                           </button>
                                           <button 
                                               onClick={() => onDeleteWorksheet(ws.id)} 
                                               className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition" 
                                               aria-label="Supprimer"
                                           >
                                               <Trash2 className="h-4 w-4" />
                                           </button>
                                       </div>
                                   </div>

                                   {/* Meta info */}
                                   <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                                       <div className="flex items-center gap-4">
                                           <span className="flex items-center gap-1.5 font-medium">
                                               <FileText className="h-4 w-4 text-slate-400" />
                                               {exerciseCount} ex.
                                           </span>
                                           {classNameLabel && (
                                               <span className="truncate max-w-[120px] bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{classNameLabel}</span>
                                           )}
                                       </div>
                                       <div className="flex items-center gap-2">
                                           <span className="flex items-center gap-1.5">
                                               <Calendar className="h-4 w-4 text-slate-400" />
                                               {new Date(ws.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                           </span>
                                           <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                                       </div>
                                   </div>
                               </div>
                            </div>
                        );
                    })}

                    {/* "New" card */}
                    <div 
                        onClick={handleOpenCreateJson}
                        className="group rounded-none border-2 border-dashed border-slate-300 hover:border-blue-600 flex items-center justify-center cursor-pointer transition-all min-h-[200px] bg-white hover:bg-blue-50/50"
                    >
                        <div className="flex flex-col items-center gap-3 text-slate-500 group-hover:text-blue-600 transition-colors">
                            <Plus className="h-8 w-8" />
                            <span className="text-base font-medium">Créer une nouvelle fiche</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-24 border-2 border-dashed border-slate-300 rounded-none bg-white">
                    {searchQuery ? (
                        <>
                            <Search className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-slate-600">Aucun résultat</h2>
                            <p className="text-slate-500 mt-2 text-base">Essayez avec d'autres mots-clés.</p>
                        </>
                    ) : (
                        <>
                            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-slate-600">Aucune fiche</h2>
                            <p className="text-slate-500 mt-2 text-base">Importez un fichier JSON ou créez une nouvelle fiche pour commencer.</p>
                        </>
                    )}
                </div>
            )}

            <JSONEditorModal 
                isOpen={isJsonModalOpen}
                onClose={() => setIsJsonModalOpen(false)}
                onImport={handleJsonSave}
                initialValue={jsonMode === 'edit' && editingWorksheet ? editingWorksheet.content : undefined}
                confirmLabel={jsonMode === 'create' ? "Enregistrer" : "Appliquer"}
            />
            </div>
        </div>
    );
};

export default Dashboard;
