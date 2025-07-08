export type Source = {
  id: number;
  english_name: string;
  parent: number | null; //pk parent
}

export type SourceNodeType = (Source & { label: string }) | {
  label: 'Root',
  english_name: 'Root',
  parent: null;
  id: -1
}
