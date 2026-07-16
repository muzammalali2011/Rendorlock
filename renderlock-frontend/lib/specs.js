// Shared spec helpers — used by both pages
// New format: GPU_MODEL|GPU_COUNT|VRAM|RAM|STORAGE|CONNECTION_URL
// Legacy fmt:  GPU_MODEL|CONNECTION_URL  (2 parts only)

export const parseSpecs = (str) => {
    if (!str) return { gpuModel: '', gpuCount: '', vram: '', ram: '', storage: '', connectionUrl: '' };
    const p = str.split('|').map(s => s.trim());
    if (p.length >= 6) {
        return { gpuModel: p[0], gpuCount: p[1], vram: p[2], ram: p[3], storage: p[4], connectionUrl: p[5] };
    }
    // Legacy 2-part
    return { gpuModel: p[0] || '', gpuCount: '', vram: '', ram: '', storage: '', connectionUrl: p[1] || '' };
};

export const buildSpecString = (f) =>
    `${f.gpuModel}|${f.gpuCount}|${f.vram}|${f.ram}|${f.storage}|${f.connectionUrl}`;
