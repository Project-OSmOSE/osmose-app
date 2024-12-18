import { AppState } from '@/service/app.ts';

export function selectAnnotationFileDuration(state: AppState) {
  const file = state.annotator.file
  if (!file) return 0;
  const start = new Date(file.start).getTime() / 1000;
  const end = new Date(file.end).getTime() / 1000;
  return end - start;
}