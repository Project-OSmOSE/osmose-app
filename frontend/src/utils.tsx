// Utils functions

export const alphanumeric_keys = [
  ["&", "é", "\"", "'", "(", "-", "è", "_", "ç"],
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
];

export function arrayToMap(array: Array<any>, key: any) {
  let res = new Map();
  array.forEach((item) => {
    res.set(item[key], item);
  });
  return res;
}

export function formatTimestamp(rawSeconds: number, withMs: boolean = true) {
  const hours: number = Math.floor(rawSeconds / 3600);
  const minutes: number = Math.floor(rawSeconds / 60) % 60;
  const seconds: number = Math.floor(rawSeconds) % 60;
  const ms: number = rawSeconds - seconds;

  const hPart: string = (hours > 0) ? (String(hours).padStart(2, '0') + ':') : '';
  const mPart: string = String(minutes).padStart(2, '0') + ':';
  const sPart: string = String(seconds).padStart(2, '0');
  const msPart: string = withMs ? ('.' + ms.toFixed(3).slice(-3)) : '';

  return `${hPart}${mPart}${sPart}${msPart}`;
}

// Tag colors management
const COLORS = ['#00b1b9', '#a23b72', '#f18f01', '#c73e1d', '#bb7e5d', '#eac435', '#98ce00', '#2a2d34', '#6761a8', '#009b72'];

export function buildTagColors(tags: Array<string>): Map<string, string> {
  const tagColors = tags.map((tag, idx): [string, string] =>
    [tag, COLORS[idx % COLORS.length]]
  );

  return new Map(tagColors);
}

export function getTagColor(tags: Map<string, string>, tag: string): string {
  return tags.get(tag) ?? '#bbbbbb';
}

export function buildErrorMessage (err: any): string {
  if (err !== null && typeof err === 'object' && err.status && err.message) {
    return 'Status: ' + err.status.toString() +
      ' - Reason: ' + err.message +
      (err.response.body.title ? ` - ${err.response.body.title}` : '') +
      (err.response.body.detail ? ` - ${err.response.body.detail}` : '');
  } else if (typeof err === 'string') {
    return err;
  } else {
    return err?.toString();
  }
}
