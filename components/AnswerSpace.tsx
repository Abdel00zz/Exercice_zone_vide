import React, { useRef, useCallback, useId, useMemo } from 'react';

interface AnswerSpaceProps {
  height?: number;
  onHeightChange: (newHeight: number) => void;
}

// Configuration
const MM_TO_PX = 3.7795275591;
const GRID_SIZE_MM = 5;
const GRID_SIZE_PX = GRID_SIZE_MM * MM_TO_PX;
const MIN_HEIGHT = 40;
const MAX_HEIGHT = 750;

// Palette Seyes douce et harmonieuse
const THEME = {
  screen: {
    bg: '#fefdf8',
    gridLine: '#e8e4da',
    dot: '#d5d0c3',
    border: '#e5e1d5',
  },
  print: {
    bg: '#fefbf0',
    gridLine: '#d8d2c0',
    dot: '#cec8b8',
  },
};

const AnswerSpace: React.FC<AnswerSpaceProps> = ({ height = 120, onHeightChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const rafId = useRef<number>(0);

  // ID unique pour les patterns SVG
  const uid = useId().replace(/:/g, '');
  const gridPatternId = `grid-${uid}`;

  // Calcul optimisé du nombre de lignes (mémorisé)
  const gridDimensions = useMemo(() => {
    const cols = Math.ceil(180 / GRID_SIZE_MM) + 1;
    const rows = Math.floor(height / GRID_SIZE_PX) + 1;
    return { cols, rows };
  }, [height]);

  // Calcul de la nouvelle hauteur avec snapping
  const calculateHeight = useCallback((clientY: number): number => {
    const delta = clientY - startY.current;
    const rawHeight = startHeight.current + delta;
    const snapped = Math.round(rawHeight / GRID_SIZE_PX) * GRID_SIZE_PX;
    return Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, snapped));
  }, []);

  // Mise à jour fluide avec RAF
  const handleMove = useCallback((clientY: number) => {
    if (!isResizing.current) return;

    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      onHeightChange(calculateHeight(clientY));
    });
  }, [calculateHeight, onHeightChange]);

  // Nettoyage des listeners
  const cleanup = useCallback(() => {
    isResizing.current = false;
    cancelAnimationFrame(rafId.current);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Mouse events
  const handleMouseMove = useCallback((e: MouseEvent) => handleMove(e.clientY), [handleMove]);
  const handleMouseUp = useCallback(() => {
    cleanup();
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [cleanup, handleMouseMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    isResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = containerRef.current.offsetHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  // Touch events
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      handleMove(e.touches[0].clientY);
    }
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    cleanup();
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }, [cleanup, handleTouchMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current || e.touches.length !== 1) return;

    isResizing.current = true;
    startY.current = e.touches[0].clientY;
    startHeight.current = containerRef.current.offsetHeight;

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove, handleTouchEnd]);

  return (
    <div className="my-3 answer-space group">
      <div
        ref={containerRef}
        className="w-full relative rounded-lg transition-shadow duration-200 hover:shadow-md print:rounded-none print:shadow-none print:border-none"
        style={{
          height: `${height}px`,
          backgroundColor: THEME.screen.bg,
          border: `1px solid ${THEME.screen.border}`,
          overflow: 'hidden',
        }}
      >
        {/* ═══════════════════════════════════════════════════════════════
            SVG GRILLE - VERSION ÉCRAN (Pattern pour performance)
        ═══════════════════════════════════════════════════════════════ */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none print:hidden"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ overflow: 'hidden' }}
        >
          <defs>
            <pattern
              id={gridPatternId}
              width={GRID_SIZE_PX}
              height={GRID_SIZE_PX}
              patternUnits="userSpaceOnUse"
            >
              <rect width="100%" height="100%" fill={THEME.screen.bg} />
              {/* Ligne verticale */}
              <line
                x1={GRID_SIZE_PX}
                y1="0"
                x2={GRID_SIZE_PX}
                y2={GRID_SIZE_PX}
                stroke={THEME.screen.gridLine}
                strokeWidth="0.6"
              />
              {/* Ligne horizontale */}
              <line
                x1="0"
                y1={GRID_SIZE_PX}
                x2={GRID_SIZE_PX}
                y2={GRID_SIZE_PX}
                stroke={THEME.screen.gridLine}
                strokeWidth="0.6"
              />
              {/* Point d'intersection */}
              <circle
                cx={GRID_SIZE_PX}
                cy={GRID_SIZE_PX}
                r="0.8"
                fill={THEME.screen.dot}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
        </svg>

        {/* ═══════════════════════════════════════════════════════════════
            SVG GRILLE - VERSION IMPRESSION (Lignes explicites)
            Seyes doux avec couleurs harmonieuses
        ═══════════════════════════════════════════════════════════════ */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none hidden print:block"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{
            overflow: 'hidden',
            shapeRendering: 'crispEdges',
          }}
        >
          {/* Fond crème doux */}
          <rect width="100%" height="100%" fill={THEME.print.bg} />

          {/* Lignes verticales */}
          {Array.from({ length: gridDimensions.cols }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * GRID_SIZE_PX}
              y1="0"
              x2={i * GRID_SIZE_PX}
              y2={height}
              stroke={THEME.print.gridLine}
              strokeWidth="0.5"
            />
          ))}

          {/* Lignes horizontales */}
          {Array.from({ length: gridDimensions.rows }, (_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * GRID_SIZE_PX}
              x2="100%"
              y2={i * GRID_SIZE_PX}
              stroke={THEME.print.gridLine}
              strokeWidth="0.5"
            />
          ))}

          {/* Points aux intersections */}
          {Array.from({ length: gridDimensions.cols }, (_, col) =>
            Array.from({ length: gridDimensions.rows }, (_, row) => (
              <circle
                key={`p${col}-${row}`}
                cx={col * GRID_SIZE_PX}
                cy={row * GRID_SIZE_PX}
                r="0.6"
                fill={THEME.print.dot}
              />
            ))
          )}
        </svg>

        {/* Poignée de redimensionnement */}
        <div
          className="absolute bottom-0 left-0 w-full h-5 cursor-row-resize z-10 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 no-print"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          role="slider"
          aria-label="Ajuster la hauteur"
          aria-valuemin={MIN_HEIGHT}
          aria-valuemax={MAX_HEIGHT}
          aria-valuenow={height}
          tabIndex={0}
        >
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-12 h-1 bg-amber-600/40 rounded-full hover:bg-amber-600/60 transition-colors" />
            <div className="w-8 h-0.5 bg-amber-600/25 rounded-full" />
          </div>
        </div>

        {/* Indicateur de hauteur */}
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-mono bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity no-print select-none">
          {height}px
        </div>
      </div>
    </div>
  );
};

export default AnswerSpace;
