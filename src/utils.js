// @flow

// Utils functions

export function arrayToObject(array: Array<any>, key: any) {
  return array.reduce((obj, item) => {
    obj[item[key]] = item
    return obj
  }, {});
}

// Object.values alternative for flow (cf https://github.com/facebook/flow/issues/2221)
export function objectValues(obj: any): Array<any> {
  return Object.keys(obj).map(key => obj[key]);
}

export function formatTimestamp(rawSeconds: number, withMs: ?boolean = true) {
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
  const tagColors = tags.map((tag, idx) =>
    [tag, COLORS[idx % COLORS.length]]
  );

  return new Map(tagColors);
}

export function getTagColor(tags: Map<string, string>, tag: string): string {
  const color: ?string = tags.get(tag);
  return color ? color : '#bbbbbb';
}
