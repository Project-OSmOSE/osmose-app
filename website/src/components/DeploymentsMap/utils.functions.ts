export function getMinZoom(value: number, zoom = 1): number {
  return 2 ** (zoom + 1) > value ? zoom : getMinZoom(value, zoom + 1)
}

export function getRandomColor() {
  return "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0");
}

export function getColorLuma(color: string) {
  const c = color.substring(1);  // strip #
  const rgb = parseInt(c, 16);   // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff;  // extract red
  const g = (rgb >>  8) & 0xff;  // extract green
  const b = (rgb >>  0) & 0xff;  // extract blue

  return 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
}