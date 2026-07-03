import React, { useRef, useState, useMemo } from 'react';
import type { Worksheet, WorksheetContent } from '../types';
import { FileUp, Trash2, Pencil, Search, Code, Calendar, ChevronRight, FileText, Plus, Download, MoreHorizontal, Layers3 } from 'lucide-react';
import JSONEditorModal from './JSONEditorModal';
import { Button, buttonVariants } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuItem } from './ui/dropdown-menu';

interface DashboardProps {
    worksheets: Worksheet[];
    onSelectWorksheet: (id: string) => void;
    onAddWorksheet: (worksheet: Worksheet) => void;
    onDeleteWorksheet: (id: string) => void;
    onRenameWorksheet: (id: string, newName: string) => void;
    onUpdateWorksheet: (id: string, content: WorksheetContent) => void;
    onRestoreBackup: (backupWorksheets: Worksheet[]) => void;
    setImportError: (error: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    worksheets,
    onSelectWorksheet,
    onAddWorksheet,
    onDeleteWorksheet,
    onRenameWorksheet,
    onUpdateWorksheet,
    onRestoreBackup,
    setImportError
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(6);
    
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
    const [jsonMode, setJsonMode] = useState<'create' | 'edit'>('create');
    const [editingWorksheet, setEditingWorksheet] = useState<Worksheet | null>(null);
    const [openActionsId, setOpenActionsId] = useState<string | null>(null);

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
                const jsonData = JSON.parse(text);
                
                // Check if it's a backup (array of worksheets)
                if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].id && jsonData[0].content) {
                    onRestoreBackup(jsonData as Worksheet[]);
                } else {
                    processImport(jsonData as WorksheetContent, file.name);
                }
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

    const handleExportAll = () => {
        const dataStr = JSON.stringify(worksheets, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `backup_fiches_${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const filteredWorksheets = useMemo(() => {
        if (!searchQuery) {
            return worksheets;
        }
        return worksheets.filter(ws => 
            ws.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [worksheets, searchQuery]);

    const sortedWorksheets = useMemo(() => {
        return [...filteredWorksheets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [filteredWorksheets]);

    const visibleWorksheets = sortedWorksheets.slice(0, visibleCount);

    return (
        <div className="carbon-shell min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-12 md:px-10">

            {/* ── Header ── */}
            <header className="mb-8 rounded-none border border-[#e0e0e0] bg-white p-5 shadow-none backdrop-blur">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-semibold font-display text-[#161616] tracking-tight">Mes Fiches d'Exercices</h1>
                        <p className="mt-2 text-sm text-[#525252]">{worksheets.length} fiche{worksheets.length !== 1 ? 's' : ''} disponible{worksheets.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:items-center">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <Search className="h-5 w-5 text-slate-400 absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 w-full sm:w-72 rounded-none bg-white pl-10"
                                aria-label="Rechercher une fiche par nom"
                            />
                        </div>
                        
                        <Button
                            onClick={handleExportAll}
                            variant="secondary"
                            className="h-11 shrink-0 rounded-none bg-[#0f62fe] text-white hover:bg-[#0353e9]"
                            title="Exporter toutes les fiches en JSON"
                        >
                            <Download className="h-5 w-5" />
                            <span className="hidden sm:inline">Exporter JSON</span>
                        </Button>

                        <Button
                            onClick={handleOpenCreateJson}
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 shrink-0 rounded-none text-[#525252] hover:text-[#0f62fe] hover:border-[#0f62fe]"
                            title="Editeur JSON"
                            aria-label="Editeur JSON"
                        >
                            <Code className="h-5 w-5" />
                        </Button>

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
                            className={buttonVariants({ className: 'h-11 cursor-pointer shrink-0 rounded-none' })}
                        >
                            <FileUp className="h-5 w-5" />
                            <span>Importer JSON</span>
                        </label>
                    </div>
                </div>
            </header>
            
            {/* ── Cards grid ── */}
            {sortedWorksheets.length > 0 ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* "New" card */}
                    <Card 
                        onClick={handleOpenCreateJson}
                        className="group rounded-none border border-dashed border-[#e0e0e0] bg-white hover:border-[#8d8d8d] flex items-center justify-center cursor-pointer transition-all min-h-[200px] hover:bg-white"
                    >
                        <div className="flex flex-col items-center gap-3 text-[#525252] group-hover:text-[#262626] transition-colors">
                            <Plus className="h-8 w-8" />
                            <span className="text-base font-medium">Créer une nouvelle fiche</span>
                        </div>
                    </Card>

                    {visibleWorksheets.map((ws) => {
                        const classNameLabel = ws.content?.settings?.className?.trim() || '';
                        const exerciseCount = ws.content?.exercises?.length || 0;

                        return (
                            <Card 
                                key={ws.id} 
                                className="group rounded-none border border-[#e0e0e0] bg-white flex flex-col transition-all duration-200 hover:border-[#8d8d8d] hover:bg-white hover:shadow-none cursor-pointer min-h-[220px]"
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
                                                   className="text-lg font-semibold font-display text-[#161616] w-full border-b-2 border-blue-600 focus:outline-none bg-transparent pb-1"
                                               />
                                           </form>
                                       ) : (
                                           <h2 className="text-lg font-semibold font-display text-[#161616] leading-snug line-clamp-2 flex-1 group-hover:text-[#161616] transition-colors">
                                               {ws.name}
                                           </h2>
                                       )}

                                       {/* Actions regroupées */}
                                       <DropdownMenu
                                           open={openActionsId === ws.id}
                                           onOpenChange={(open) => setOpenActionsId(open ? ws.id : null)}
                                           trigger={
                                               <Button
                                                   variant="ghost"
                                                   size="icon"
                                                   className="h-9 w-9 rounded-none text-[#525252] opacity-70 transition hover:bg-[#e0e0e0] hover:text-[#161616] group-hover:opacity-100"
                                                   aria-label="Actions de la fiche"
                                                   onClick={(e) => { e.stopPropagation(); setOpenActionsId(openActionsId === ws.id ? null : ws.id); }}
                                               >
                                                   <MoreHorizontal className="h-5 w-5" />
                                               </Button>
                                           }
                                       >
                                           <DropdownMenuItem onClick={() => { handleRename(ws); setOpenActionsId(null); }}>
                                               <Pencil className="h-4 w-4" /> Renommer
                                           </DropdownMenuItem>
                                           <DropdownMenuItem onClick={() => { handleEditJson(ws); setOpenActionsId(null); }}>
                                               <Code className="h-4 w-4" /> Éditer JSON
                                           </DropdownMenuItem>
                                           <DropdownMenuItem className="text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => { onDeleteWorksheet(ws.id); setOpenActionsId(null); }}>
                                               <Trash2 className="h-4 w-4" /> Supprimer
                                           </DropdownMenuItem>
                                       </DropdownMenu>
                                   </div>

                                   {/* Meta info */}
                                   <div className="mt-auto pt-5 border-t border-[#e0e0e0] flex items-center justify-between text-base text-[#525252]">
                                       <div className="flex items-center gap-5">
                                           <span className="flex items-center gap-2 font-medium">
                                               <Layers3 className="h-5 w-5 text-[#525252]" />
                                               {exerciseCount} ex.
                                           </span>
                                           {classNameLabel && (
                                               <span className="truncate max-w-[150px] bg-[#f4f4f4] px-3 py-1 text-sm font-semibold text-[#393939] border border-[#e0e0e0]">{classNameLabel}</span>
                                           )}
                                       </div>
                                       <div className="flex items-center gap-3">
                                           <span className="flex items-center gap-2">
                                               <Calendar className="h-5 w-5 text-slate-400" />
                                               {new Date(ws.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                           </span>
                                           <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#525252] transition-colors" />
                                       </div>
                                   </div>
                               </div>
                            </Card>
                        );
                    })}
                </div>
                
                {visibleCount < sortedWorksheets.length && (
                    <div className="mt-10 text-center">
                        <Button
                            onClick={() => setVisibleCount(prev => prev + 6)}
                            variant="outline"
                            className="rounded-none px-8"
                        >
                            Voir plus
                        </Button>
                    </div>
                )}
                </>
            ) : (
                <div className="text-center py-24 border-2 border-dashed border-slate-300 rounded-none bg-white">
                    {searchQuery ? (
                        <>
                            <Search className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-slate-600">Aucun résultat</h2>
                            <p className="text-[#525252] mt-2 text-base">Essayez avec d'autres mots-clés.</p>
                        </>
                    ) : (
                        <>
                            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-slate-600">Aucune fiche</h2>
                            <p className="text-[#525252] mt-2 text-base mb-6">Importez un fichier JSON ou créez une nouvelle fiche pour commencer.</p>
                            <Button onClick={handleOpenCreateJson} className="rounded-none">
                                <Plus className="h-5 w-5" />
                                Créer une fiche
                            </Button>
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
