import { QueryParams } from './type.ts';

export function encodeQueryParams(queryParams?: QueryParams): string {
  if (!queryParams) return '';
  return encodeURI(`?${ Object.entries(queryParams).map(([ key, value ]) => `${ key }=${ value }`).join('&') }`);
}

export function  download(text: string,
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