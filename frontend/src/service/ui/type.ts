export type UIState = {
  fileFilters: Partial<Pick<FileFilters, 'campaignID'>> & Omit<FileFilters, 'campaignID'>
}

export type FileFilters = {
  campaignID: number;
  search: string | undefined;
  isSubmitted: boolean | undefined;
  withUserAnnotations: boolean | undefined;
}