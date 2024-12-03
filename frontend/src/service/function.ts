import { QueryParams } from './type.ts';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

export function encodeQueryParams(queryParams?: QueryParams): string {
  if (!queryParams) return '';
  return encodeURI(`?${ Object.entries(queryParams).map(([ key, value ]) => `${ key }=${ value }`).join('&') }`);
}

export function download(text: string,
                         filename: string,
                         contentType: string,) {
  const url = URL.createObjectURL(new File([ text ], filename, { type: contentType }));
  // Using <a>-linking trick https://stackoverflow.com/a/19328891/2730032
  const a = document.createElement('a');
  a.style.display = "none";
  a.href = url;
  a.type = contentType;
  a.download = filename;
  if (!document.body) throw new Error("Unexpectedly missing <body>");
  document.body.appendChild(a);
  a.click();
}

export function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string | undefined {
  if (!error) return undefined;
  if ((error as SerializedError).message) return (error as SerializedError).message;
  if ((error as any).error) return (error as any).error;
  const data = (error as FetchBaseQueryError).data as any;
  const detail = Object.prototype.hasOwnProperty.call(data, 'detail') ? data['detail'] : null;
  return detail ?? JSON.stringify(data);
}

export function getNewItemID(items?: { id: number }[]) {
  return Math.min(0, ...(items ?? []).map(r => r.id)) - 1;
}