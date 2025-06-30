export function getMinZoom(value: number, zoom = 1): number {
  if (!isFinite(value)) return 0
  return 2 ** (zoom + 1) > value ? zoom : getMinZoom(value, zoom + 1)
}


function componentToHex(c: number): string {
  let hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

export function intToRGB(value: number): string {
  //credit to https://stackoverflow.com/a/2262117/2737978 for the idea of how to implement
  value *= 5623
  let blue = 128 + Math.floor(value % 128);
  let green = 128 + Math.floor(value / 128 % 128);
  let red = 128 + Math.floor(value / 128 / 128 % 128);
  return '#' + componentToHex(red) + componentToHex(green) + componentToHex(blue)
}


export function getColorLuma(color: string) {
  const c = color.substring(1);  // strip #
  const rgb = parseInt(c, 16);   // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff;  // extract red
  const g = (rgb >>  8) & 0xff;  // extract green
  const b = (rgb >>  0) & 0xff;  // extract blue

  return 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
}