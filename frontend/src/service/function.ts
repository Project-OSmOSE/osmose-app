import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { Item } from "@/types/item.ts";

export function getErrorMessage(error: FetchBaseQueryError | SerializedError | unknown | string | undefined): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if ((error as SerializedError).message) return (error as SerializedError).message;
  if ((error as FetchBaseQueryError).status === 500) return '[500] Internal server error';
  const data = (error as FetchBaseQueryError).data as any;
  if (!data) return (error as any).error;
  const detail = Object.prototype.hasOwnProperty.call(data, 'detail') ? data['detail'] : null;
  if (detail) return detail;

  try {
    if (typeof data === 'object')
      return JSON.stringify(data);
    return data
  } catch {
    return data;
  }
}

export function getNewItemID(items?: { id: number }[]) {
  return Math.min(0, ...(items ?? []).map(r => r.id)) - 1;
}

function downloadFile(filename: string, type: string, text: string) {
  const url = URL.createObjectURL(new File([ text ], filename, { type }));
  // Using <a>-linking trick https://stackoverflow.com/a/19328891/2730032
  const a = document.createElement('a');
  a.style.display = "none";
  a.href = url;
  a.type = type;
  a.download = filename;
  if (!document.body) throw new Error("Unexpectedly missing <body>");
  document.body.appendChild(a);
  a.click();
}

export async function downloadResponseHandler(response: Response) {
  // TODO: reject errors correctly (catchable) - like a standard API error
  if (response.status !== 200) return `[${ response.status }] ${ response.statusText }`;
  const filenameRegExp = /filename=([^&]*)/.exec(decodeURI(response.url))
  if (!filenameRegExp || filenameRegExp.length < 2) throw new Error("No filename provided");
  const filename = filenameRegExp[1];
  const type = response.headers.get('content-type')
  if (!type) throw new Error('No file type provided')
  downloadFile(filename, type, await response.text())
}

export function pluralize(data: any[]) {
  return data.length > 1 ? 's' : ''
}

export function searchFilter(values: Array<Item>, search: string | undefined): Array<Item> {
  if (!search) return []
  const searchData = search.split(' ').filter(s => s).map(s => s.toLowerCase());
  return values.filter(value => {
    const valueData = value.label.split(' ').filter(v => v).map(v => v.toLowerCase());
    for (const s of searchData) {
      if (valueData.find(v => v.includes(s))) continue;
      return false;
    }
    return true;
  })
    .sort((a, b) => {
      const aShow = a.label.toLowerCase();
      const bShow = b.label.toLowerCase();
      if (aShow.indexOf(search.toLowerCase()) > bShow.indexOf(search.toLowerCase())) {
        return 1;
      } else if (aShow.indexOf(search.toLowerCase()) < bShow.indexOf(search.toLowerCase())) {
        return -1;
      }
      return a.label.localeCompare(b.label)
    })
}

export function buildErrorMessage(e: any): string {
  if (e !== null && typeof e === 'object') {
    if (e.status && (e.message || e.response)) {
      if (e.response) {
        if (e.response.body) {
          const message = Object
            .entries(e.response.body)
            .map(([ key, value ]) => Array.isArray(value) ? `${ key }: ${ value.join(' - ') }` : '')
            .join("\n");
          if (message.length > 0) return message;
          try {
            return JSON.stringify(e.response.body)
          } catch (e) {
            console.warn(e)
          }
        }
        if (e.response.text) {
          try {
            return JSON.stringify(e.response.text)
          } catch (e) {
            console.warn(e)
          }
          return e.response.text
        }
      }
      return 'Status: ' + e.status.toString() +
        ' - Reason: ' + e.message +
        (e.response.body?.title ? ` - ${ e.response.body.title }` : '') +
        (e.response.body?.detail ? ` - ${ e.response.body.detail }` : '');
    } else return JSON.stringify(e);
  } else if (typeof e === 'string') {
    return e;
  } else {
    return e?.toString();
  }
}

export function formatCSVToTable(content: string, separator: string): string[][] {
  const lines = content.replaceAll('\r', '').split('\n').map(l => [ l ]);
  return lines.map(l => l.flatMap(l => l.split(separator))).filter(d => d.length > 1);
}

export function dateToString(date?: Date | string): string | undefined {
  if (!date) return undefined;
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function datetimeToString(date?: Date | string): string | undefined {
  if (!date) return undefined;
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
