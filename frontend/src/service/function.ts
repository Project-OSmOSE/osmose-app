import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

export function getErrorMessage(error: FetchBaseQueryError | SerializedError | unknown | string | undefined): string | undefined {
    if (!error) return undefined;
    if (typeof error === 'string') return error;
    if ((error as SerializedError).message) return (error as SerializedError).message;
    if ((error as FetchBaseQueryError).status === 500) return '[500] Internal server error';
    let data = (error as FetchBaseQueryError).data as any;
    if (!data) {
        if ((error as any).error) data = (error as any).error;
        else data = error
    }
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

export function getNewItemID(items?: { id: number | string }[]) {
    return Math.min(0, ...(items ?? []).map(r => +r.id)) - 1;
}

export function pluralize(data?: any[] | null) {
    if (!data) return ''
    return data.length > 1 ? 's' : ''
}

export function dateToString(date?: Date | string | null): string | undefined {
    if (!date) return undefined;
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleDateString('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    })
}

export function datetimeToString(date?: Date | string | null): string | undefined {
    if (!date) return undefined;
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleDateString('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h24',
        timeZoneName: 'short',
        timeZone: 'UTC',
    })
}

export function formatTime(rawSeconds?: number, withMs: boolean = false): string {
    if (rawSeconds === undefined) return ''
    const hours: number = Math.floor(rawSeconds / 3600);
    const minutes: number = Math.floor(rawSeconds / 60) % 60;
    const seconds: number = Math.floor(rawSeconds) % 60;
    const ms: number = rawSeconds - seconds;

    const hPart: string = (hours > 0) ? (String(hours).padStart(2, '0') + ':') : '';
    const mPart: string = String(minutes).padStart(2, '0') + ':';
    const sPart: string = String(seconds).padStart(2, '0');
    const msPart: string = withMs ? ('.' + ms.toFixed(3).slice(-3)) : '';

    return `${ hPart }${ mPart }${ sPart }${ msPart }`;
}

export function frequencyToString(value: number): string {
    if (value < 1000) return value.toString()
    let newValue: string | number = value / 1000;
    if (newValue % 1 > 0) newValue = newValue.toFixed(1)
    return `${ newValue }k`;
}

function downloadFile(filename: string, type: string, blob: Blob) {
    const url = URL.createObjectURL(new File([ blob ], filename, { type }));
    // Using <a>-linking trick https://stackoverflow.com/a/19328891/2730032
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.type = type;
    a.download = filename;
    if (!document.body) throw new Error('Unexpectedly missing <body>');
    document.body.appendChild(a);
    a.click();
}

export async function downloadResponseHandler(response: Response, filename?: string) {
    // TODO: reject errors correctly (catchable) - like a standard API error
    console.debug(response.headers)
    if (response.status !== 200) return `[${ response.status }] ${ response.statusText }`;
    const type = response.headers.get('content-type')
    if (!type) throw new Error('No file type provided')
    if (!filename) {
        const contentDispositionHeader = response.headers.get('content-disposition')
        if (!contentDispositionHeader) throw new Error('No Content-Disposition header')
        const filenameRegExp = new RegExp(/filename="(\S*)"/g).exec(contentDispositionHeader)
        if (!filenameRegExp) throw new Error('No filename in Content-Disposition header')
        filename = filenameRegExp[1]
    }
    downloadFile(filename, type, await response.blob())
}

export function getDownloadResponseHandler(filename?: string) {
    return (response: Response) => downloadResponseHandler(response, filename)
}