export function formatTimestamp(rawSeconds: number, withMs: boolean = true) {
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

export function buildErrorMessage(e: any): string {
  if (e !== null && typeof e === 'object' && e.status && e.message) {
    return 'Status: ' + e.status.toString() +
      ' - Reason: ' + e.message +
      (e.response.body?.title ? ` - ${ e.response.body.title }` : '') +
      (e.response.body?.detail ? ` - ${ e.response.body.detail }` : '');
  } else if (typeof e === 'string') {
    return e;
  } else {
    return e?.toString();
  }
}

export function formatCSV(content: string,
                          separators: Array<string>,
                          mandatoryColumns: Array<string>,
                          optionalColumns: Array<string>) {
  let lines = content.split('\n').map(l => [l]);
  for (const separator of separators) {
    lines = lines.map(l => l.flatMap(l => l.split(separator)));
  }

  const headers = lines.shift();
  if (!headers) throw new Error('Missing header line');

  for (const column of mandatoryColumns) {
    if (!headers.includes(column)) throw new Error(`Missing column ${ column }`);
  }

  return lines.filter(l => l.length >= mandatoryColumns.length).map(l => {
    const data: any = {};
    for (const column of mandatoryColumns) {
      data[column] = l[headers.indexOf(column)];
    }
    for (const column of optionalColumns) {
      const index = headers.indexOf(column);
      if (index > -1) data[column] = l[index];
    }
    return data;
  })
}
