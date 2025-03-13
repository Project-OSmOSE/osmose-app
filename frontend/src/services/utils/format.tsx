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
