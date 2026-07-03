const waitForImages = async (): Promise<void> => {
  const images = Array.from(document.images).filter((image) => !image.complete);
  await Promise.all(images.map((image) => new Promise<void>((resolve) => {
    image.addEventListener('load', () => resolve(), { once: true });
    image.addEventListener('error', () => resolve(), { once: true });
  })));
};

const waitForMathJax = async (): Promise<void> => {
  const mathJax = (window as unknown as { MathJax?: { typesetPromise?: () => Promise<void>; startup?: { promise?: Promise<void> } } }).MathJax;
  await mathJax?.startup?.promise;
  await mathJax?.typesetPromise?.();
};

export const printWorksheet = async (worksheetName: string): Promise<void> => {
  const originalTitle = document.title;
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR').replace(/\//g, '-');
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  const safeName = worksheetName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  document.documentElement.classList.add('is-print-preparing');
  document.title = `${safeName}_${dateStr}_${timeStr}`;

  try {
    await document.fonts?.ready;
    await waitForMathJax();
    await waitForImages();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    window.print();
  } finally {
    window.setTimeout(() => {
      document.title = originalTitle;
      document.documentElement.classList.remove('is-print-preparing');
    }, 150);
  }
};
