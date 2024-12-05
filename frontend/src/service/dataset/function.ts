import { DatasetFile } from './type.ts';

export function getFileDuration(file?: DatasetFile): number {
  if (!file) return 0;
  const start = new Date(file.start).getTime() / 1000;
  const end = new Date(file.end).getTime() / 1000;
  return end - start;
}