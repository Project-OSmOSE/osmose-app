import { CSVColumns } from "@/types/csv-import-annotations.ts";


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

export function formatCSV(content: string,
                          separator: string,
                          columns: CSVColumns) {
  let lines = content.replace('\r', '').split('\n').map(l => [ l ]);
  lines = lines.map(l => l.flatMap(l => l.split(separator)));

  const headers = lines.shift()?.map(h => h.replace('\r', ''));
  if (!headers) throw new Error('Missing header line');

  const missingColumns = [];
  for (const column of columns.required) {
    if (!headers.includes(column)) missingColumns.push(column);
  }
  if (missingColumns.length > 0)
    throw new Error(`Missing columns: ${ missingColumns.join(', ') }`);

  return lines.filter(l => l.length >= columns.required.length).map(l => {
    const data: any = {};
    for (const column of columns.required) {
      data[column] = l[headers.indexOf(column)];
    }
    for (const column of columns.optional) {
      const index = headers.indexOf(column);
      if (index > -1) data[column] = l[index];
    }
    return data;
  })
}
