import type { Media, MediaType } from './uploadthing';

const EXTENSIONS: Record<MediaType, string> = {
  photos: '.jpg',
  gif: '.gif',
  videos: '.mp4',
};

function toFilename(title: string, type: MediaType): string {
  const safe = title.replace(/[^a-zA-Z0-9\-_àâäéèêëîïôùûüç ]/g, '').trim().replace(/\s+/g, '_');
  return `${safe}${EXTENSIONS[type]}`;
}

export async function downloadFile(media: Media): Promise<void> {
  const response = await fetch(media.url, { mode: 'cors' });
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = toFilename(media.title, media.type);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

export async function downloadFilesAsZip(
  files: Media[],
  zipName: string,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  await Promise.all(
    files.map(async (media, i) => {
      const response = await fetch(media.url, { mode: 'cors' });
      const blob = await response.blob();
      zip.file(toFilename(media.title, media.type), blob);
      onProgress?.(i + 1, files.length);
    })
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const blobUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}
