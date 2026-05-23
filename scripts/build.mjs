import { cp, mkdir, rm } from 'node:fs/promises';

const publishDir = new URL('../public/', import.meta.url);
const rootIndex = new URL('../index.html', import.meta.url);
const publicIndex = new URL('../public/index.html', import.meta.url);
const imagesDir = new URL('../images/', import.meta.url);
const publicImages = new URL('../public/images/', import.meta.url);

await rm(publishDir, { recursive: true, force: true });
await mkdir(publishDir, { recursive: true });
await cp(rootIndex, publicIndex);
await cp(imagesDir, publicImages, { recursive: true }).catch(() => {});
