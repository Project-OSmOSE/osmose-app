import { ID } from "@/service/type.ts";

export type UIState = {
  fileFilters: Partial<Pick<FileFilters, 'campaignID'>> & Omit<FileFilters, 'campaignID'>
}

export type FileFilters = {
  campaignID: ID;
  search: string | undefined;
  isSubmitted: boolean | undefined;
  withUserAnnotations: boolean | undefined;
}