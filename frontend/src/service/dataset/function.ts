import { AppState } from '@/service/app.ts';
import { DatasetFile } from "@/service/dataset/type.ts";

export function selectAnnotationFileDuration(state: AppState) {
  return getDuration(state.annotator.file);
}

export function getDuration(file?: DatasetFile) {
  if (!file) return 0;
  const start = new Date(file.start).getTime() / 1000;
  const end = new Date(file.end).getTime() / 1000;
  return end - start;
}